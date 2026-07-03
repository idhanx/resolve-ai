from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.complaint import Complaint


async def complaint_counts_by_status(db: AsyncSession, department: str | None = None) -> dict[str, int]:
    stmt = select(Complaint.status, func.count()).group_by(Complaint.status)
    if department:
        stmt = stmt.where(Complaint.department == department)
    rows = (await db.execute(stmt)).all()
    return {status: count for status, count in rows}

