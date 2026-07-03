from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.complaint_intelligence.inference import analyze_complaint
from app.ai.corrective_action.engine import recommend_corrective_action
from app.models.complaint import Complaint
from app.repositories.complaint_repository import (
    create_complaint,
    find_duplicate_submission,
    get_complaint_by_id_for_employee,
    list_employee_complaints,
)
from app.schemas.complaint import ComplaintCreate, VerificationCreate
from app.utils.helpers import compact_whitespace, slugify_filename
from app.utils.security import contains_malicious_pattern, fingerprint_submission, sanitize_text


async def submit_complaint(
    db: AsyncSession,
    employee_id: str,
    payload: ComplaintCreate,
    attachment: tuple[str, str, str] | None = None,
) -> Complaint:
    title = sanitize_text(compact_whitespace(payload.title))
    description = sanitize_text(compact_whitespace(payload.description))

    if contains_malicious_pattern(title) or contains_malicious_pattern(description):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Input contains disallowed patterns")

    fingerprint = fingerprint_submission(employee_id, title, description)
    duplicate = await find_duplicate_submission(db, employee_id, fingerprint)
    if duplicate:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Duplicate submission detected")

    ai_data = analyze_complaint(title, description, payload.department, payload.complaint_type)
    action_reco = recommend_corrective_action(ai_data["ai_category"])

    complaint = Complaint(
        employee_id=employee_id,
        complaint_type=payload.complaint_type,
        title=title,
        description=description,
        department=payload.department,
        status="Submitted",
        ai_category=ai_data["ai_category"],
        priority=ai_data["priority"],
        evidence_score=ai_data["evidence_score"],
        confidence=ai_data["confidence"],
        evidence_breakdown=ai_data["evidence_breakdown"],
        intelligence_summary=ai_data["intelligence_summary"],
        assigned_executive=ai_data["assigned_executive"],
        attachment_path=attachment[0] if attachment else None,
        attachment_name=attachment[1] if attachment else None,
        attachment_mime_type=attachment[2] if attachment else None,
        duplicate_fingerprint=fingerprint,
        escalated_flag=False,
        action_plan=None,
        verification=None,
        evidence_files=[{"name": attachment[1], "mime_type": attachment[2], "path": attachment[0]}] if attachment else [],
    )
    return await create_complaint(db, complaint)


async def get_employee_issue_history(db: AsyncSession, employee_id: str, page: int, page_size: int):
    return await list_employee_complaints(db, employee_id, page, page_size)


async def get_employee_issue_detail(db: AsyncSession, employee_id: str, complaint_id: str):
    return await get_complaint_by_id_for_employee(db, complaint_id, employee_id)


async def employee_verify_resolution(
    db: AsyncSession,
    complaint_id: str,
    employee_id: str,
    payload: VerificationCreate,
) -> Complaint:
    complaint = await get_complaint_by_id_for_employee(db, complaint_id, employee_id)
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    complaint.status = "Verified"
    complaint.verification = {
        "improvement_rating": payload.improvement_rating,
        "score": payload.score,
        "comments": payload.comments,
        "date": datetime.now(timezone.utc).date().isoformat(),
    }
    await db.commit()
    await db.refresh(complaint)
    return complaint
