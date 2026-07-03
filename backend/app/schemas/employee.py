from datetime import datetime

from pydantic import BaseModel

from app.schemas.complaint import ComplaintListItem


class EmployeeProfileOut(BaseModel):
    id: str
    employee_id: str
    username: str | None = None
    name: str
    email: str | None = None
    role: str
    department: str | None = None
    reporting_manager_name: str | None = None
    avatar_url: str | None = None
    is_active: bool = True
    last_login_at: str | None = None


class EmployeeIssuesOut(BaseModel):
    items: list[ComplaintListItem]
    page: int
    page_size: int
    total: int


class EmployeeIssueDetailOut(BaseModel):
    complaint_id: str
    title: str
    description: str
    attachment_path: str | None = None
    attachment_name: str | None = None
    attachment_mime_type: str | None = None
    created_at: datetime
    status: str
    ai_category: str | None = None
    priority: str | None = None
    evidence_score: int | None = None
    confidence: int | None = None
    evidence_breakdown: list[str] | None = None
    intelligence_summary: str | None = None
    assigned_executive: str | None = None
    assigned_manager_id: str | None = None
    escalated_flag: bool = False
    evidence_files: list[dict] | None = None
    action_plan: dict | list | None = None
    verification: dict | list | None = None
