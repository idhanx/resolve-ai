from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_roles
from app.models.user import User
from app.schemas.complaint import ComplaintCreate, ComplaintListItem, VerificationCreate
from app.schemas.employee import EmployeeIssueDetailOut, EmployeeIssuesOut, EmployeeProfileOut
from app.schemas.survey import SurveyCreate
from app.services.complaint_service import employee_verify_resolution, get_employee_issue_detail, get_employee_issue_history, submit_complaint
from app.services.dashboard_service import employee_dashboard_summary
from app.services.notification_service import list_notifications
from app.services.survey_service import submit_survey

router = APIRouter(prefix="/api/employee", tags=["employee"])


@router.get("/profile", response_model=EmployeeProfileOut)
async def profile(current_user: User = Depends(require_roles("Employee", "Manager", "CTO", "COO", "CEO"))):
    return EmployeeProfileOut(
        id=str(current_user.id),
        employee_id=current_user.employee_id,
        username=current_user.username,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        department=current_user.department,
        reporting_manager_name=current_user.reporting_manager_name,
        avatar_url=current_user.avatar_url,
        is_active=current_user.is_active,
        last_login_at=current_user.last_login_at,
    )


@router.get("/issues", response_model=EmployeeIssuesOut)
async def issues(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    items, total = await get_employee_issue_history(db, current_user.employee_id, page, page_size)
    return EmployeeIssuesOut(
        items=[
            ComplaintListItem(
                complaint_id=item.id,
                title=item.title,
                created_at=item.created_at,
                status=item.status,
            )
            for item in items
        ],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get("/issues/{complaint_id}", response_model=EmployeeIssueDetailOut)
async def issue_detail(complaint_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    item = await get_employee_issue_detail(db, current_user.employee_id, complaint_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
    return EmployeeIssueDetailOut(
        complaint_id=item.id,
        title=item.title,
        description=item.description,
        attachment_path=item.attachment_path,
        attachment_name=item.attachment_name,
        attachment_mime_type=item.attachment_mime_type,
        created_at=item.created_at,
        status=item.status,
        ai_category=item.ai_category,
        priority=item.priority,
        evidence_score=item.evidence_score,
        confidence=item.confidence,
        evidence_breakdown=item.evidence_breakdown,
        intelligence_summary=item.intelligence_summary,
        assigned_executive=item.assigned_executive,
        assigned_manager_id=item.assigned_manager_id,
        escalated_flag=item.escalated_flag,
        action_plan=item.action_plan,
        verification=item.verification,
        evidence_files=item.evidence_files,
    )


@router.post("/issues", response_model=EmployeeIssueDetailOut, status_code=status.HTTP_201_CREATED)
async def create_issue(
    payload: ComplaintCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    complaint = await submit_complaint(db, current_user.employee_id, payload)
    return EmployeeIssueDetailOut(
        complaint_id=complaint.id,
        title=complaint.title,
        description=complaint.description,
        attachment_path=complaint.attachment_path,
        attachment_name=complaint.attachment_name,
        attachment_mime_type=complaint.attachment_mime_type,
        created_at=complaint.created_at,
        status=complaint.status,
        ai_category=complaint.ai_category,
        priority=complaint.priority,
        evidence_score=complaint.evidence_score,
        confidence=complaint.confidence,
        evidence_breakdown=complaint.evidence_breakdown,
        intelligence_summary=complaint.intelligence_summary,
        assigned_executive=complaint.assigned_executive,
        assigned_manager_id=complaint.assigned_manager_id,
        escalated_flag=complaint.escalated_flag,
        action_plan=complaint.action_plan,
        verification=complaint.verification,
        evidence_files=complaint.evidence_files,
    )


@router.post("/surveys")
async def create_employee_survey(payload: SurveyCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    survey = await submit_survey(db, current_user.employee_id, payload)
    return {"message": "Survey received and will be reviewed in a future update.", "id": survey.id}


@router.post("/issues/{complaint_id}/verify")
async def verify_issue(
    complaint_id: str,
    payload: VerificationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    complaint = await employee_verify_resolution(db, complaint_id, current_user.employee_id, payload)
    return {"message": "Verification saved", "complaint_id": complaint.id, "status": complaint.status}


@router.get("/notifications")
async def notifications(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    items = await list_notifications(db, role="Employee")
    return {"items": [{"id": item.id, "title": item.title, "message": item.message, "read": item.read} for item in items]}


@router.get("/dashboard")
async def dashboard(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await employee_dashboard_summary(db, current_user.employee_id)
