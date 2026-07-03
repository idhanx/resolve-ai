from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class LearningCandidateCreate(BaseModel):
    source_submission_id: Optional[str] = None
    complaint_id: Optional[int] = None
    complaint_title: str
    complaint_description: str
    original_category: str
    original_department: str
    original_manager: str
    original_recommendation: str
    verification_rating: str
    verification_score: float
    employee_comments: str
    corrected_category: Optional[str] = None
    corrected_department: Optional[str] = None
    corrected_manager: Optional[str] = None
    corrected_action: Optional[str] = None


class LearningCandidateDecision(BaseModel):
    action: str
    corrected_category: Optional[str] = None
    corrected_department: Optional[str] = None
    corrected_manager: Optional[str] = None
    corrected_action: Optional[str] = None
    reviewer_notes: Optional[str] = None


class LearningCandidateResponse(BaseModel):
    id: int
    source_submission_id: Optional[str] = None
    complaint_id: Optional[int] = None
    complaint_title: str
    complaint_description: str
    original_category: str
    original_department: str
    original_manager: str
    original_recommendation: str
    verification_rating: str
    verification_score: float
    employee_comments: str
    corrected_category: Optional[str] = None
    corrected_department: Optional[str] = None
    corrected_manager: Optional[str] = None
    corrected_action: Optional[str] = None
    reviewer_notes: Optional[str] = None
    status: str
    created_at: datetime
    reviewed_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True
    )
