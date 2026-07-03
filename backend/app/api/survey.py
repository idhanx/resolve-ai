from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.survey import SurveyCreate
from app.services.survey_service import get_employee_surveys, submit_survey
from app.services.serializers import survey_to_dict

router = APIRouter(prefix="/api/survey", tags=["survey"])


@router.post("")
async def submit(payload: SurveyCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    survey = await submit_survey(db, current_user.employee_id, payload)
    return survey_to_dict(survey)


@router.get("")
async def list_my_surveys(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    surveys = await get_employee_surveys(db, current_user.employee_id)
    return {"items": [survey_to_dict(item) for item in surveys]}
