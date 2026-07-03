from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.complaint import Complaint
from app.models.user import User
from app.schemas.complaint import ComplaintCreate
from app.repositories.complaint_repository import get_complaint_by_id_for_employee, list_employee_complaints
from app.services.complaint_service import submit_complaint
from app.services.serializers import complaint_to_dict

router = APIRouter(prefix="/api/complaints", tags=["complaints"])


@router.post("")
async def create_complaint(payload: ComplaintCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    complaint = await submit_complaint(db, current_user.employee_id, payload)
    return complaint_to_dict(complaint)


@router.get("/my")
async def my_complaints(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    items, total = await list_employee_complaints(db, current_user.employee_id, page=1, page_size=100)
    return {"items": [complaint_to_dict(item) for item in items], "total": total}


@router.get("/{complaint_id}")
async def complaint_detail(
    complaint_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    complaint = await get_complaint_by_id_for_employee(db, complaint_id, current_user.employee_id)
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
    return complaint_to_dict(complaint)
