from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession


from app.models.complaint import Complaint


class DashboardRepository:

    async def _count_category_like(
        self,
        db: AsyncSession,
        keyword: str
    ) -> int:
        count = await db.scalar(
            select(func.count()).where(
                func.lower(Complaint.category).like(
                    f"%{keyword.lower()}%"
                )
            )
        )

        return count or 0

    async def get_dashboard(self, db: AsyncSession):

        total = await db.scalar(
            select(func.count()).select_from(Complaint)
        )

        critical = await db.scalar(
            select(func.count()).where(
                Complaint.severity == "Critical"
            )
        )

        high = await db.scalar(
            select(func.count()).where(
                Complaint.severity == "High"
            )
        )

        resolved = await db.scalar(
            select(func.count()).where(
                Complaint.status == "Resolved"
            )
        )

        pending = await db.scalar(
            select(func.count()).where(
                Complaint.status == "Submitted"
            )
        )

        leadership = await self._count_category_like(
            db,
            "leadership"
        )

        compensation = await self._count_category_like(
            db,
            "compensation"
        )

        work_environment = await self._count_category_like(
            db,
            "work environment"
        )

        avg_confidence = await db.scalar(
            select(func.avg(Complaint.confidence))
        )

        # ------------------------------
        # Department leaderboard (risk + health)
        # ------------------------------
        now = datetime.utcnow()

        # Open = not yet fully resolved/verified
        open_statuses = ["Submitted", "Pending Review", "In Progress"]
        resolved_statuses = ["Resolved", "Verified"]

        async def dept_metrics(dept: str) -> dict:
            open_count = await db.scalar(
                select(func.count()).where(
                    Complaint.department == dept,
                    Complaint.status.in_(open_statuses),
                )
            )
            resolved_count = await db.scalar(
                select(func.count()).where(
                    Complaint.department == dept,
                    Complaint.status.in_(resolved_statuses),
                )
            )

            # Average open age (days)
            avg_open_age_days = await db.scalar(
                select(func.avg(func.extract('epoch', (now - Complaint.created_at)) / 86400.0)).where(
                    Complaint.department == dept,
                    Complaint.status.in_(open_statuses),
                )
            )

            open_count = open_count or 0
            resolved_count = resolved_count or 0
            avg_open_age_days = avg_open_age_days or 0.0

            total_for_ratio = open_count + resolved_count
            resolution_rate = (
                (resolved_count / total_for_ratio) if total_for_ratio > 0 else 1.0
            )

            # Risk model:
            # - More open items => higher risk
            # - Older open items => higher risk
            # - Better resolution rate => lower risk
            # Normalize components into roughly 0..1 and combine.
            open_pressure = (
                open_count / (open_count + resolved_count)
                if (open_count + resolved_count) > 0
                else 0.0
            )
            age_pressure = min(avg_open_age_days / 30.0, 1.0)  # 30 days saturates
            health_score = round(
                max(0.0, 100.0 * (0.65 * (1.0 - open_pressure) + 0.35 * (1.0 - age_pressure))),
                2,
            )
            risk_score = round(100.0 - health_score, 2)

            # labels
            if risk_score >= 80:
                risk_label = "High"
            elif risk_score >= 50:
                risk_label = "Medium"
            else:
                risk_label = "Low"

            return {
                "department": dept,
                "open_count": int(open_count),
                "resolved_count": int(resolved_count),
                "avg_open_age_days": round(float(avg_open_age_days), 2),
                "resolution_rate": round(resolution_rate * 100.0, 2),
                "health_score": health_score,
                "risk_score": risk_score,
                "risk_label": risk_label,
            }

        # supported departments
        departments = ["Technology", "Operations"]
        dept_rows = [await dept_metrics(d) for d in departments]

        highest_risk = max(dept_rows, key=lambda x: x["risk_score"]) if dept_rows else None
        lowest_risk = min(dept_rows, key=lambda x: x["risk_score"]) if dept_rows else None

        return {
            "total_complaints": total or 0,
            "critical_complaints": critical or 0,
            "high_complaints": high or 0,
            "resolved_complaints": resolved or 0,
            "pending_complaints": pending or 0,
            "leadership_complaints": leadership or 0,
            "compensation_complaints": compensation or 0,
            "work_environment_complaints": work_environment or 0,
            "average_confidence": round(avg_confidence or 0, 2),
            "department_leaderboard": dept_rows,
            "highest_risk_department": highest_risk,
            "lowest_risk_department": lowest_risk,
        }



dashboard_repository = DashboardRepository()
