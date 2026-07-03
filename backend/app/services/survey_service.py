from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.business_impact.engine import assess_business_impact
from app.models.survey import Survey
from app.repositories.survey_repository import create_survey, list_surveys
from app.schemas.survey import SurveyCreate


async def submit_survey(db: AsyncSession, employee_id: str, payload: SurveyCreate) -> Survey:
    survey = Survey(employee_id=employee_id, ratings=payload.ratings.model_dump(), comments=payload.comments)
    return await create_survey(db, survey)


async def get_employee_surveys(db: AsyncSession, employee_id: str) -> list[Survey]:
    return await list_surveys(db, employee_id)

