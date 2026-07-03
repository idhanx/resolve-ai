from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.survey import Survey


async def create_survey(db: AsyncSession, survey: Survey) -> Survey:
    db.add(survey)
    await db.commit()
    await db.refresh(survey)
    return survey


async def list_surveys(db: AsyncSession, employee_id: str | None = None) -> list[Survey]:
    stmt = select(Survey)
    if employee_id:
        stmt = stmt.where(Survey.employee_id == employee_id)
    result = await db.execute(stmt.order_by(Survey.created_at.desc()))
    return list(result.scalars().all())

