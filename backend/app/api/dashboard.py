from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services.dashboard_service import employee_dashboard_summary, role_dashboard_summary

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
async def summary(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await role_dashboard_summary(db, current_user.role, current_user.department)

