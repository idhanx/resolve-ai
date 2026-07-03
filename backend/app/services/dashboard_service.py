from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.dashboard_repository import complaint_counts_by_status


async def employee_dashboard_summary(db: AsyncSession, employee_id: str) -> dict:
    counts = await complaint_counts_by_status(db)
    return {"employee_id": employee_id, "counts": counts}


async def role_dashboard_summary(db: AsyncSession, role: str, department: str | None = None) -> dict:
    counts = await complaint_counts_by_status(db, department)
    return {"role": role, "department": department, "counts": counts}

