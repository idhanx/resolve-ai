from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task
from app.repositories.task_repository import get_task_by_complaint_id, upsert_task


async def assign_task(
    db: AsyncSession,
    complaint_id: str,
    manager_id: str,
    title: str,
    description: str,
    checklist: list[dict],
    instructions: str | None = None,
) -> Task:
    task = await get_task_by_complaint_id(db, complaint_id)
    if task:
        task.manager_id = manager_id
        task.title = title
        task.description = description
        task.checklist = checklist
        task.instructions = instructions
        task.progress = 0
        return await upsert_task(db, task)

    task = Task(
        complaint_id=complaint_id,
        manager_id=manager_id,
        title=title,
        description=description,
        checklist=checklist,
        instructions=instructions,
        progress=0,
    )
    return await upsert_task(db, task)

