from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.complaint import Complaint


router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"],
    dependencies=[Depends(get_current_user)],
)

UNRESOLVED_STATUSES = {
    "submitted",
    "pending review",
    "in progress",
    "under investigation",
}


def _is_unresolved(status: str | None) -> bool:
    return (status or "").strip().lower() in UNRESOLVED_STATUSES


def _risk_score(count: int, average_confidence: float) -> int:
    score = 82 + (count * 3)

    if average_confidence >= 85:
        score += 2

    return max(85, min(90, round(score)))


def _build_alert(complaints: list[Complaint]) -> dict:
    sample = complaints[0]
    confidence_values = [
        float(complaint.confidence or 0)
        for complaint in complaints
    ]
    average_confidence = (
        sum(confidence_values) / len(confidence_values)
        if confidence_values
        else 0
    )
    department = sample.department or "Technology"
    executive = "COO" if department == "Operations" else "CTO"
    risk_score = _risk_score(len(complaints), average_confidence)

    return {
        "id": (
            f"{department}-{sample.category}"
            .lower()
            .replace(" ", "-")
            .replace("&", "and")
        ),
        "department": department,
        "category": sample.category,
        "issue_count": len(complaints),
        "risk_score": risk_score,
        "severity": "Critical" if risk_score >= 90 else "High",
        "notify": [executive, "CEO", "CHRO"],
        "error": (
            f"{len(complaints)} unresolved complaints are repeating in "
            f"{sample.category}."
        ),
        "why_it_occurred": (
            sample.business_impact
            or sample.executive_summary
            or "The same issue has continued without a verified resolution."
        ),
        "productivity_loss": (
            "Repeated unresolved work can create delivery delays, rework, "
            "overtime, and manager capacity loss."
        ),
        "reputation_risk": (
            "Employees may lose trust in internal reporting and leadership "
            "response, increasing attrition and employer-brand risk."
        ),
        "recommended_action": (
            sample.recommendation
            or "Assign an accountable manager and executive deadline immediately."
        ),
        "assigned_executive": executive,
    }


@router.get("/escalations")
async def escalation_alerts(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Complaint).order_by(Complaint.created_at.desc())
    )

    unresolved = [
        complaint
        for complaint in result.scalars().all()
        if _is_unresolved(complaint.status)
    ]

    grouped: dict[str, list[Complaint]] = defaultdict(list)
    for complaint in unresolved:
        key = f"{complaint.department}:{complaint.category}"
        grouped[key].append(complaint)

    return [
        _build_alert(complaints)
        for complaints in grouped.values()
        if len(complaints) >= 2
    ]
