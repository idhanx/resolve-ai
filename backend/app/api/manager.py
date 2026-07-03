from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_roles
from app.models.user import User
from app.schemas.complaint import ActionPlanUpdate
from app.repositories.complaint_repository import get_complaint_by_id, list_complaints_assigned_to_manager
from app.repositories.task_repository import get_task_by_complaint_id, upsert_task
from app.services.notification_service import list_notifications
from app.services.serializers import complaint_to_dict

router = APIRouter(prefix="/api/manager", tags=["manager"])


@router.get("/dashboard")
async def dashboard(current_user: User = Depends(require_roles("Manager"))):
    return {"message": "Manager dashboard", "manager": current_user.name}


@router.get("/actions")
async def assigned_actions(current_user: User = Depends(require_roles("Manager")), db: AsyncSession = Depends(get_db)):
    complaints = await list_complaints_assigned_to_manager(db, current_user.employee_id)
    items = [complaint_to_dict(item) for item in complaints if item.action_plan]
    return {"items": items}


@router.get("/actions/{complaint_id}")
async def action_detail(complaint_id: str, current_user: User = Depends(require_roles("Manager")), db: AsyncSession = Depends(get_db)):
    complaint = await get_complaint_by_id(db, complaint_id)
    if not complaint or complaint.assigned_manager_id != current_user.employee_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action not found")
    task = await get_task_by_complaint_id(db, complaint_id)
    return complaint_to_dict(complaint, task)


@router.put("/actions/{complaint_id}")
async def update_action(complaint_id: str, payload: ActionPlanUpdate, current_user: User = Depends(require_roles("Manager")), db: AsyncSession = Depends(get_db)):
    complaint = await get_complaint_by_id(db, complaint_id)
    if not complaint or complaint.assigned_manager_id != current_user.employee_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action not found")

    task = await get_task_by_complaint_id(db, complaint_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    task.checklist = payload.checklist
    task.progress = payload.progress
    if complaint.action_plan:
        complaint.action_plan = {
            **complaint.action_plan,
            "checklist": payload.checklist,
            "progress": payload.progress,
            "completionNotes": payload.notes or complaint.action_plan.get("completionNotes"),
            "proofFileName": payload.proof_name or complaint.action_plan.get("proofFileName"),
            "proofUrl": payload.proof_url or complaint.action_plan.get("proofUrl"),
        }
    await upsert_task(db, task)
    await db.commit()
    await db.refresh(complaint)
    return complaint_to_dict(complaint, task)


@router.post("/actions/{complaint_id}/complete")
async def complete_action(complaint_id: str, current_user: User = Depends(require_roles("Manager")), db: AsyncSession = Depends(get_db)):
    complaint = await get_complaint_by_id(db, complaint_id)
    if not complaint or complaint.assigned_manager_id != current_user.employee_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action not found")

    task = await get_task_by_complaint_id(db, complaint_id)
    if task:
        task.progress = 100
        await upsert_task(db, task)

    complaint.status = "Resolved"
    if complaint.action_plan:
        complaint.action_plan = {
            **complaint.action_plan,
            "progress": 100,
        }
    await db.commit()
    await db.refresh(complaint)
    return complaint_to_dict(complaint, task)


@router.get("/notifications")
async def notifications(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    items = await list_notifications(db, role="Manager")
    return {"items": [{"id": item.id, "title": item.title, "message": item.message, "read": item.read} for item in items]}
