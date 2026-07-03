from datetime import datetime, timedelta, timezone

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.complaint import Complaint


async def create_complaint(db: AsyncSession, complaint: Complaint) -> Complaint:
    db.add(complaint)
    await db.commit()
    await db.refresh(complaint)
    return complaint


async def list_employee_complaints(db: AsyncSession, employee_id: str, page: int, page_size: int):
    offset = (page - 1) * page_size
    items_stmt = (
        select(Complaint)
        .where(Complaint.employee_id == employee_id)
        .order_by(desc(Complaint.created_at))
        .offset(offset)
        .limit(page_size)
    )
    count_stmt = select(func.count()).select_from(Complaint).where(Complaint.employee_id == employee_id)
    items = (await db.execute(items_stmt)).scalars().all()
    total = int((await db.execute(count_stmt)).scalar_one())
    return items, total


async def get_complaint_by_id_for_employee(db: AsyncSession, complaint_id: str, employee_id: str) -> Complaint | None:
    stmt = select(Complaint).where(Complaint.id == complaint_id, Complaint.employee_id == employee_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_complaint_by_id(db: AsyncSession, complaint_id: str) -> Complaint | None:
    result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    return result.scalar_one_or_none()


async def list_complaints_by_department(db: AsyncSession, department: str, limit: int | None = None) -> list[Complaint]:
    stmt = select(Complaint).where(Complaint.department == department).order_by(desc(Complaint.created_at))
    if limit is not None:
        stmt = stmt.limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def list_complaints_assigned_to_manager(db: AsyncSession, manager_id: str) -> list[Complaint]:
    stmt = (
        select(Complaint)
        .where(Complaint.assigned_manager_id == manager_id)
        .order_by(desc(Complaint.created_at))
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def find_duplicate_submission(db: AsyncSession, employee_id: str, fingerprint: str) -> Complaint | None:
    window_start = datetime.now(timezone.utc) - timedelta(seconds=60)
    stmt = select(Complaint).where(
        Complaint.employee_id == employee_id,
        Complaint.duplicate_fingerprint == fingerprint,
        Complaint.created_at >= window_start,
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()
