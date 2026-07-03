from datetime import datetime
import json

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.complaint import Complaint
from app.schemas.complaint import ComplaintLifecycleUpdate


class ComplaintRepository:

    async def create(
        self,
        db: AsyncSession,
        complaint: Complaint
    ) -> Complaint:

        db.add(complaint)

        await db.commit()

        await db.refresh(complaint)

        return complaint

    # -----------------------------------------

    async def get_by_id(
        self,
        db: AsyncSession,
        complaint_id: int
    ):

        result = await db.execute(

            select(Complaint).where(
                Complaint.id == complaint_id
            )

        )

        return result.scalar_one_or_none()

    # -----------------------------------------

    async def get_all(
        self,
        db: AsyncSession
    ):

        result = await db.execute(

            select(Complaint).order_by(
                Complaint.created_at.desc()
            )

        )

        return result.scalars().all()

    # -----------------------------------------

    async def update_lifecycle(
        self,
        db: AsyncSession,
        complaint: Complaint,
        payload: ComplaintLifecycleUpdate
    ) -> Complaint:
        updates = payload.model_dump(exclude_unset=True)

        if "status" in updates:
            complaint.status = updates["status"]

        if "manager" in updates:
            complaint.manager = updates["manager"]

        if "assigned_manager_id" in updates:
            complaint.assigned_manager_id = updates["assigned_manager_id"]

        if "priority" in updates:
            complaint.priority = updates["priority"]

        if "resolution" in updates:
            complaint.resolution = updates["resolution"]

        if "action_plan" in updates:
            complaint.action_plan_json = (
                json.dumps(updates["action_plan"])
                if updates["action_plan"] is not None
                else None
            )

        if "verification" in updates:
            complaint.verification_json = (
                json.dumps(updates["verification"])
                if updates["verification"] is not None
                else None
            )

        complaint.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(complaint)

        return complaint

    # -----------------------------------------

    async def dashboard_stats(
        self,
        db: AsyncSession
    ):

        total = await db.scalar(
            select(func.count()).select_from(Complaint)
        )

        critical = await db.scalar(
            select(func.count()).where(
                Complaint.severity == "Critical"
            )
        )

        leadership = await db.scalar(
            select(func.count()).where(
                Complaint.category == "Leadership"
            )
        )

        resolved = await db.scalar(
            select(func.count()).where(
                Complaint.status == "Resolved"
            )
        )

        return {

            "total_complaints": total or 0,

            "critical_cases": critical or 0,

            "leadership_cases": leadership or 0,

            "resolved_cases": resolved or 0

        }


complaint_repository = ComplaintRepository()
