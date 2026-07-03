import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db

from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintLifecycleUpdate,
    ComplaintResponse,
)

from app.models.complaint import Complaint

from app.repositories.complaint_repository import (
    complaint_repository,
)

# AI
from app.ai.complaint_intelligence.predictor import ComplaintPredictor
from app.ai.rag_service import rag_service
from app.ai.pipeline.reasoning_engine import reasoning_engine

router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"],
    dependencies=[Depends(get_current_user)],
)

predictor = ComplaintPredictor()

MANAGER_ROUTES = {
    "Technology": {
        "infrastructure": "Sophia Rodriguez",
        "platform": "Alex Kim",
    },
    "Operations": {
        "operations": "Emily Chen",
        "people": "Michael Vance",
    },
}

MANAGER_DIRECTORY = [
    {
        "id": "mgr-1",
        "name": "Sophia Rodriguez",
        "department": "Technology",
        "manager_type": "Technical",
        "specializations": ["Infrastructure", "Database", "DevOps", "Network"],
        "executive_owner": "CTO",
        "capacity": 6,
    },
    {
        "id": "mgr-2",
        "name": "Alex Kim",
        "department": "Technology",
        "manager_type": "Technical",
        "specializations": ["Software", "API", "Developer Experience", "Product"],
        "executive_owner": "CTO",
        "capacity": 7,
    },
    {
        "id": "mgr-3",
        "name": "Emily Chen",
        "department": "Operations",
        "manager_type": "Operational",
        "specializations": ["Logistics", "Warehouse", "Shift Planning", "Vendor"],
        "executive_owner": "COO",
        "capacity": 8,
    },
    {
        "id": "mgr-4",
        "name": "Michael Vance",
        "department": "Operations",
        "manager_type": "Operational",
        "specializations": ["Manager Conduct", "Communication", "Performance Reviews", "Payroll"],
        "executive_owner": "COO",
        "capacity": 6,
    },
]

TECHNICAL_TERMS = {
    "api",
    "code",
    "database",
    "deployment",
    "developer",
    "infrastructure",
    "laptop",
    "migration",
    "network",
    "server",
    "software",
    "staging",
    "system",
}

OPERATIONS_TERMS = {
    "attendance",
    "coo",
    "delivery",
    "fulfillment",
    "logistics",
    "operations",
    "overtime",
    "safety",
    "shift",
    "supplier",
    "vendor",
    "warehouse",
}

PEOPLE_TERMS = {
    "career",
    "communication",
    "harassment",
    "manager",
    "performance review",
    "promotion",
    "salary",
}

DOMAIN_CATEGORIES = {
    "Career Development & Growth",
    "Compensation & Benefits",
    "Developer Experience & Infrastructure",
    "Leadership & Management",
    "Operational Efficiency",
    "Work Environment & Safety",
}


def _contains_any(text: str, terms: set[str]) -> bool:
    return any(term in text for term in terms)


def _submission_type(request: ComplaintCreate) -> str:
    requested_type = (request.submission_type or "").strip().title()

    if requested_type in {"Concern", "Feedback", "Suggestion", "Survey"}:
        return requested_type

    text = f"{request.title} {request.description}".lower()

    if "suggest" in text or "idea" in text or "improve" in text:
        return "Suggestion"

    if "feedback" in text:
        return "Feedback"

    return "Concern"


def _primary_evidence_match(
    evidence_matches: list[dict] | None,
    require_department: bool = False
) -> dict | None:
    for match in evidence_matches or []:
        department = (match.get("department") or "").strip()

        if require_department and department in {"", "All"}:
            continue

        if match.get("source_type") in {"policy", "approved_correction"}:
            return match

    return None


def _policy_category(
    evidence_matches: list[dict] | None
) -> str | None:
    for match in evidence_matches or []:
        category = match.get("category")

        if category in DOMAIN_CATEGORIES:
            return category

    return None


def _manager_id_for_name(manager_name: str) -> str | None:
    for manager in MANAGER_DIRECTORY:
        if manager["name"] == manager_name:
            return manager["id"]

    return None


def _evidence_for_response(
    evidence_matches: list[dict]
) -> list[dict]:
    compact: list[dict] = []

    for match in evidence_matches[:5]:
        compact.append(
            {
                "id": match.get("id"),
                "source_type": match.get("source_type"),
                "title": match.get("title"),
                "category": match.get("category"),
                "department": match.get("department"),
                "owner": match.get("owner"),
                "citation": match.get("citation"),
                "score": match.get("score"),
                "matched_terms": match.get("matched_terms", []),
                "content": match.get("content"),
                "recommended_action": match.get("recommended_action"),
            }
        )

    return compact


def _route_complaint(
    request: ComplaintCreate,
    evidence_matches: list[dict] | None = None
) -> dict[str, str]:
    text = f"{request.title} {request.description}".lower()
    requested_department = request.department.strip().title()
    evidence_match = _primary_evidence_match(
        evidence_matches,
        require_department=True
    )

    if evidence_match:
        department = evidence_match["department"]
    elif _contains_any(text, OPERATIONS_TERMS):
        department = "Operations"
    elif _contains_any(text, TECHNICAL_TERMS):
        department = "Technology"
    elif requested_department in MANAGER_ROUTES:
        department = requested_department
    else:
        department = "Technology"

    category_hint = (
        evidence_match.get("category")
        if evidence_match
        else _policy_category(evidence_matches)
    )

    if department == "Operations":
        manager_key = (
            "people"
            if (
                _contains_any(text, PEOPLE_TERMS)
                or category_hint in {
                    "Career Development & Growth",
                    "Compensation & Benefits",
                    "Leadership & Management",
                }
            )
            else "operations"
        )
        executive = "COO"
    else:
        manager_key = "infrastructure" if _contains_any(text, TECHNICAL_TERMS) else "platform"
        executive = "CTO"

    manager = MANAGER_ROUTES[department][manager_key]

    return {
        "department": department,
        "manager": manager,
        "manager_id": _manager_id_for_name(manager) or "",
        "executive": executive,
        "reason": (
            (
                f"Matched policy evidence {evidence_match['citation']} and routed to "
                if evidence_match
                else f"Matched {department.lower()} issue signals and routed to "
            )
            + f"{manager} with {executive} oversight."
        ),
    }


def _category_for(
    text: str,
    predicted_category: str,
    evidence_matches: list[dict] | None = None
) -> str:
    evidence_category = _policy_category(evidence_matches)

    if evidence_category:
        return evidence_category

    if _contains_any(text, OPERATIONS_TERMS):
        if "overtime" in text or "shift" in text or "safety" in text:
            return "Work Environment & Safety"
        return "Operational Efficiency"

    if _contains_any(text, TECHNICAL_TERMS):
        return "Developer Experience & Infrastructure"

    if _contains_any(text, PEOPLE_TERMS):
        if "career" in text or "promotion" in text:
            return "Career Development & Growth"
        return "Leadership & Management"

    return predicted_category or "General Organizational Wellness"


def _confidence_for(submission_type: str, predicted_confidence: float) -> float:
    score_floors = {
        "Concern": 90.0,
        "Feedback": 80.0,
        "Suggestion": 85.0,
        "Survey": 80.0,
    }

    return min(
        98.0,
        max(float(predicted_confidence or 0), score_floors[submission_type])
    )


def _fallback_analysis(
    request: ComplaintCreate,
    submission_type: str,
    evidence_matches: list[dict] | None = None
) -> dict:
    severity = "High" if submission_type == "Concern" else "Medium"
    evidence_match = _primary_evidence_match(evidence_matches) or (
        evidence_matches or [None]
    )[0]
    recommended_action = (
        evidence_match.get("recommended_action")
        if evidence_match
        else (
            "Assign the routed manager, set an executive deadline, "
            "and require employee verification."
        )
    )
    evidence_reason = (
        f" Policy source: {evidence_match.get('citation')}."
        if evidence_match
        else ""
    )

    return {
        "analysis": {
            "alerts": {
                "severity": severity,
            },
            "businessImpact": {
                "priority": severity,
                "reason": (
                    "The unresolved issue may create productivity loss, "
                    "employee trust risk, and delivery delay."
                    + evidence_reason
                ),
            },
            "recommendation": {
                "action": recommended_action,
            },
            "executiveSummary": (
                f"{request.title} requires accountable manager review and "
                "executive visibility until resolution."
            ),
            "policyEvidence": [
                {
                    "citation": evidence_match.get("citation"),
                    "howItApplies": evidence_match.get("content"),
                }
            ] if evidence_match else [],
        },
    }


def _safe_nested(
    payload: dict,
    *keys: str,
    default: str = ""
) -> str:
    value = payload

    for key in keys:
        if not isinstance(value, dict):
            return default

        value = value.get(key)

    if value is None:
        return default

    return str(value)


@router.post("/", response_model=ComplaintResponse)
async def create_complaint(
    request: ComplaintCreate,
    db: AsyncSession = Depends(get_db)
):

    # ---------------------------------------
    # Step 1 DistilBERT Classification
    # ---------------------------------------

    submission_type = _submission_type(request)
    text = f"{request.title} {request.description}".lower()

    try:
        prediction = predictor.predict(
            request.description
        )
    except Exception:
        prediction = {
            "category": "General Organizational Wellness",
            "confidence": 0,
        }

    preliminary_category = _category_for(
        text,
        prediction["category"]
    )
    preliminary_routing = _route_complaint(request)
    evidence_matches = await rag_service.retrieve(
        complaint=f"{request.title}\n\n{request.description}",
        category=preliminary_category,
        department=preliminary_routing["department"],
        db=db
    )

    category = _category_for(
        text,
        prediction["category"],
        evidence_matches
    )
    routing = _route_complaint(
        request,
        evidence_matches
    )
    confidence = _confidence_for(
        submission_type,
        prediction["confidence"]
    )
    policy_evidence = _evidence_for_response(
        evidence_matches
    )

    # ---------------------------------------
    # Step 2 Groq Reasoning
    # ---------------------------------------

    try:
        analysis = reasoning_engine.analyze(
            complaint=f"{request.title}\n\n{request.description}",
            employee_context={
                "department": routing["department"],
                "designation": request.designation,
                "manager": routing["manager"],
                "routingReason": routing["reason"],
                "submissionType": submission_type,
            },
            similar_cases=[
                match
                for match in policy_evidence
                if match["source_type"] == "resolved_case"
            ],
            knowledge_matches=policy_evidence,
            classification={
                "category": category,
                "confidence": confidence,
            },
        )
    except Exception:
        analysis = _fallback_analysis(
            request,
            submission_type,
            evidence_matches
        )

    # ---------------------------------------
    # Step 3 Save
    # ---------------------------------------

    analysis_payload = analysis.get("analysis", {})
    analysis_severity = _safe_nested(
        analysis_payload,
        "alerts",
        "severity",
        default="Medium"
    )
    analysis_priority = _safe_nested(
        analysis_payload,
        "businessImpact",
        "priority",
        default="Medium"
    )
    severity = "High" if submission_type == "Concern" else analysis_severity
    priority = "High" if submission_type == "Concern" else analysis_priority
    top_evidence = policy_evidence[0] if policy_evidence else None
    evidence_reason = (
        f" Evidence source: {top_evidence['citation']}."
        if top_evidence
        else ""
    )
    executive_summary = _safe_nested(
        analysis_payload,
        "executiveSummary",
        default=(
            f"{request.title} requires accountable review and "
            "employee-verified resolution."
        )
    )
    recommendation_action = _safe_nested(
        analysis_payload,
        "recommendation",
        "action",
        default=(
            top_evidence["recommended_action"]
            if top_evidence
            else "Assign an accountable manager and verify the outcome."
        )
    )
    business_impact = _safe_nested(
        analysis_payload,
        "businessImpact",
        "reason",
        default="The unresolved issue may affect productivity and employee trust."
    ) + evidence_reason

    complaint = Complaint(

        employee_name=request.employee_name,

        employee_email=request.employee_email,

        department=routing["department"],

        designation=request.designation,

        manager=routing["manager"],

        assigned_manager_id=routing["manager_id"],

        title=request.title,

        description=request.description,

        submission_type=submission_type,

        category=category,

        confidence=confidence,

        severity=severity,

        priority=priority,

        executive_summary=executive_summary,

        recommendation=recommendation_action,

        business_impact=business_impact,

        policy_evidence_json=json.dumps(policy_evidence),

        routing_reason=routing["reason"],

        status="Submitted"

    )

    saved = await complaint_repository.create(
        db,
        complaint
    )

    return ComplaintResponse.model_validate(saved)


@router.get("/", response_model=list[ComplaintResponse])
async def list_complaints(
    db: AsyncSession = Depends(get_db)
):
    return await complaint_repository.get_all(db)


@router.get("/routing/managers")
async def list_routing_managers():
    return MANAGER_DIRECTORY


@router.patch("/{complaint_id}/lifecycle", response_model=ComplaintResponse)
async def update_complaint_lifecycle(
    complaint_id: int,
    payload: ComplaintLifecycleUpdate,
    db: AsyncSession = Depends(get_db)
):
    complaint = await complaint_repository.get_by_id(
        db,
        complaint_id
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    return await complaint_repository.update_lifecycle(
        db,
        complaint,
        payload
    )


@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(
    complaint_id: int,
    db: AsyncSession = Depends(get_db)
):
    complaint = await complaint_repository.get_by_id(
        db,
        complaint_id
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    return complaint
