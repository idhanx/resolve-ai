from __future__ import annotations

from app.models.complaint import Complaint
from app.models.notification import Notification
from app.models.survey import Survey
from app.models.task import Task
from app.models.user import User


def user_to_dict(user: User) -> dict:
    return {
        "id": str(user.id),
        "employee_id": user.employee_id,
        "username": user.username,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "department": user.department,
        "reporting_manager_name": user.reporting_manager_name,
        "avatar_url": user.avatar_url,
        "is_active": user.is_active,
        "last_login_at": user.last_login_at,
    }


def task_to_dict(task: Task | None) -> dict | None:
    if not task:
        return None
    return {
        "id": str(task.id),
        "complaint_id": str(task.complaint_id),
        "manager_id": task.manager_id,
        "title": task.title,
        "description": task.description,
        "progress": task.progress,
        "checklist": task.checklist,
        "instructions": task.instructions,
    }


def complaint_to_dict(complaint: Complaint, task: Task | None = None) -> dict:
    action_plan = complaint.action_plan
    if task and isinstance(action_plan, dict):
        action_plan = {
            **action_plan,
            "progress": task.progress,
            "checklist": task.checklist,
            "instructions": task.instructions or action_plan.get("instructions"),
        }

    return {
        "id": str(complaint.id),
        "employee_id": complaint.employee_id,
        "complaint_type": complaint.complaint_type,
        "title": complaint.title,
        "description": complaint.description,
        "department": complaint.department,
        "status": complaint.status,
        "ai_category": complaint.ai_category,
        "priority": complaint.priority,
        "evidence_score": complaint.evidence_score,
        "confidence": complaint.confidence,
        "evidence_breakdown": complaint.evidence_breakdown or [],
        "intelligence_summary": complaint.intelligence_summary,
        "assigned_executive": complaint.assigned_executive,
        "assigned_manager_id": complaint.assigned_manager_id,
        "attachment_path": complaint.attachment_path,
        "attachment_name": complaint.attachment_name,
        "attachment_mime_type": complaint.attachment_mime_type,
        "escalated_flag": complaint.escalated_flag,
        "duplicate_fingerprint": complaint.duplicate_fingerprint,
        "action_plan": action_plan,
        "verification": complaint.verification,
        "evidence_files": complaint.evidence_files or [],
        "created_at": complaint.created_at,
        "updated_at": complaint.updated_at,
        "task": task_to_dict(task),
    }


def notification_to_dict(notification: Notification) -> dict:
    return {
        "id": str(notification.id),
        "role": notification.role,
        "title": notification.title,
        "message": notification.message,
        "read": notification.read,
        "target_path": notification.target_path,
        "employee_id": notification.employee_id,
        "created_at": notification.created_at,
        "updated_at": notification.updated_at,
    }


def survey_to_dict(survey: Survey) -> dict:
    return {
        "id": str(survey.id),
        "employee_id": survey.employee_id,
        "ratings": survey.ratings,
        "comments": survey.comments,
        "created_at": survey.created_at,
        "updated_at": survey.updated_at,
    }
