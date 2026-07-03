from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.repositories.dashboard_repository import dashboard_repository

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/")
async def dashboard(
    db: AsyncSession = Depends(get_db)
):
    return await dashboard_repository.get_dashboard(db)
