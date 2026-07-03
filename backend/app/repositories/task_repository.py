from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task


async def get_task_by_complaint_id(db: AsyncSession, complaint_id: str) -> Task | None:
    result = await db.execute(select(Task).where(Task.complaint_id == complaint_id))
    return result.scalar_one_or_none()


async def upsert_task(db: AsyncSession, task: Task) -> Task:
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task

