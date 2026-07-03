from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_roles
from app.models.complaint import Complaint
from app.models.task import Task
from app.models.user import User
from app.schemas.complaint import ActionPlanCreate
from app.repositories.complaint_repository import get_complaint_by_id, list_complaints_by_department
from app.repositories.task_repository import get_task_by_complaint_id, upsert_task
from app.services.serializers import complaint_to_dict, user_to_dict
from app.services.task_service import assign_task

router = APIRouter(prefix="/api/department-head", tags=["department-head"])


@router.get("/dashboard")
async def dashboard(current_user: User = Depends(require_roles("CTO", "COO")), db: AsyncSession = Depends(get_db)):
    complaints = await list_complaints_by_department(db, current_user.department or "")
    pending = [item for item in complaints if item.status == "Pending Review"]
    active = [item for item in complaints if item.status == "In Progress"]
    resolved = [item for item in complaints if item.status in {"Resolved", "Verified"}]
    return {
        "department": current_user.department,
        "message": "Department head dashboard",
        "counts": {
            "pending": len(pending),
            "active": len(active),
            "resolved": len(resolved),
        },
    }


@router.get("/submissions")
async def submissions(current_user: User = Depends(require_roles("CTO", "COO")), db: AsyncSession = Depends(get_db)):
    complaints = await list_complaints_by_department(db, current_user.department or "")
    return {"items": [complaint_to_dict(item) for item in complaints]}


@router.post("/submissions/{complaint_id}/assign")
async def assign_action_plan(complaint_id: str, payload: ActionPlanCreate, current_user: User = Depends(require_roles("CTO", "COO")), db: AsyncSession = Depends(get_db)):
    complaint = await get_complaint_by_id(db, complaint_id)
    if not complaint or complaint.department != current_user.department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    task = await assign_task(
        db,
        complaint_id=complaint_id,
        manager_id=payload.manager_id or current_user.employee_id,
        title=payload.title,
        description=payload.description,
        checklist=payload.checklist,
        instructions=payload.instructions,
    )

    complaint.assigned_executive = current_user.role
    complaint.assigned_manager_id = payload.manager_id or complaint.assigned_manager_id
    complaint.status = "In Progress"
    complaint.action_plan = {
        "id": str(task.id),
        "title": payload.title,
        "description": payload.description,
        "expectedImpact": payload.expected_impact,
        "estimatedTime": payload.estimated_time,
        "businessValue": payload.business_value,
        "instructions": payload.instructions,
        "deadline": payload.deadline,
        "priority": "High",
        "progress": 0,
        "checklist": payload.checklist,
    }
    await db.commit()
    await db.refresh(complaint)
    return complaint_to_dict(complaint, task)


@router.get("/managers")
async def managers(current_user: User = Depends(require_roles("CTO", "COO")), db: AsyncSession = Depends(get_db)):
    rows = await db.execute(select(User).where(User.role == "Manager", User.department == current_user.department))
    managers = rows.scalars().all()
    return {"items": [user_to_dict(manager) for manager in managers]}


@router.get("/analytics")
async def analytics(current_user: User = Depends(require_roles("CTO", "COO")), db: AsyncSession = Depends(get_db)):
    complaints = await list_complaints_by_department(db, current_user.department or "")
    return {
        "message": "Analytics",
        "total": len(complaints),
        "resolved": len([item for item in complaints if item.status in {"Resolved", "Verified"}]),
    }


@router.get("/plans")
async def plans(current_user: User = Depends(require_roles("CTO", "COO")), db: AsyncSession = Depends(get_db)):
    complaints = await list_complaints_by_department(db, current_user.department or "")
    return {"items": [complaint_to_dict(item) for item in complaints if item.action_plan]}
