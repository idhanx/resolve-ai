from datetime import datetime

from pydantic import BaseModel, Field


class ComplaintCreate(BaseModel):
    complaint_type: str = Field(pattern="^(Feedback|Concern|Suggestion|Survey|PolicyQuestion)$")
    title: str = Field(min_length=1, max_length=150)
    description: str = Field(min_length=1, max_length=5000)
    department: str = Field(pattern="^(Technology|Operations)$")
    expected_benefits: str | None = None


class ComplaintListItem(BaseModel):
    complaint_id: str
    title: str
    created_at: datetime
    status: str


class ComplaintDetail(BaseModel):
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
    action_plan: dict | list | None = None
    verification: dict | list | None = None
    evidence_files: list[dict] | None = None


class ActionPlanCreate(BaseModel):
    title: str
    description: str
    expected_impact: str
    estimated_time: str
    business_value: str
    checklist: list[dict]
    manager_id: str | None = None
    priority: str | None = None
    instructions: str | None = None
    deadline: str | None = None


class ActionPlanUpdate(BaseModel):
    checklist: list[dict]
    progress: int = Field(ge=0, le=100)
    notes: str | None = None
    proof_name: str | None = None
    proof_url: str | None = None


class VerificationCreate(BaseModel):
    improvement_rating: str = Field(pattern="^(Yes|Partially|No)$")
    score: int = Field(ge=1, le=5)
    comments: str
