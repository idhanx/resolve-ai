from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


# -----------------------------
# Request from Frontend
# -----------------------------

class ComplaintCreate(BaseModel):
    employee_name: str
    employee_email: str
    department: str
    designation: str
    manager: str

    title: str
    description: str
    submission_type: Optional[str] = None


# -----------------------------
# Response to Frontend
# -----------------------------

class ComplaintResponse(BaseModel):
    id: int

    employee_name: str
    employee_email: str
    department: str
    designation: str
    manager: str
    assigned_manager_id: Optional[str] = None

    title: str
    description: str
    submission_type: Optional[str] = None

    category: str
    confidence: float

    severity: str
    priority: str

    executive_summary: str
    recommendation: str
    business_impact: str
    policy_evidence: list[dict[str, Any]] = Field(default_factory=list)
    action_plan: Optional[dict[str, Any]] = None
    verification: Optional[dict[str, Any]] = None

    status: str
    routing_reason: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        # Enable computed fields from @property methods
        populate_by_name=True,
    )


class ComplaintLifecycleUpdate(BaseModel):
    status: Optional[str] = None
    manager: Optional[str] = None
    assigned_manager_id: Optional[str] = None
    priority: Optional[str] = None
    resolution: Optional[str] = None
    action_plan: Optional[dict[str, Any]] = None
    verification: Optional[dict[str, Any]] = None


# -----------------------------
# Dashboard Card
# -----------------------------

class DashboardStats(BaseModel):
    total_complaints: int
    critical_cases: int
    leadership_cases: int
    resolved_cases: int
