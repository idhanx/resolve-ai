from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services.notification_service import list_notifications, mark_notifications_as_read

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("")
async def notifications(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    items = await list_notifications(db, role=current_user.role)
    return {"items": [{"id": item.id, "title": item.title, "message": item.message, "read": item.read} for item in items]}


@router.post("/read")
async def read_all(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    count = await mark_notifications_as_read(db, current_user.role)
    return {"updated": count}

