from app.ai.complaint_intelligence.predictor import predict_category
from app.ai.complaint_intelligence.preprocess import preprocess_text
from app.ai.complaint_intelligence.utils import clamp


def analyze_complaint(title: str, description: str, department: str, complaint_type: str) -> dict:
    text = preprocess_text(title, description)
    prediction = predict_category(text)

    base_score = 65
    if prediction["category"] == "Developer Experience & Infrastructure":
        base_score = 88
    elif prediction["category"] == "Career Development & Growth":
        base_score = 75
    elif prediction["category"] == "Work Environment & Safety":
        base_score = 92

    confidence = clamp(base_score + 4)
    evidence_breakdown = [
        f"Complaint type: {complaint_type}",
        f"Department: {department}",
        f"Keyword-based category match: {prediction['category']}",
    ]
    intelligence_summary = (
        f"The complaint maps to {prediction['category']} with deterministic keyword scoring. "
        f"The initial evidence confidence is {confidence}%."
    )
    assigned_executive = "CTO" if department == "Technology" else "COO"

    return {
        "ai_category": prediction["category"],
        "priority": prediction["priority"],
        "evidence_score": base_score,
        "confidence": confidence,
        "evidence_breakdown": evidence_breakdown,
        "intelligence_summary": intelligence_summary,
        "assigned_executive": assigned_executive,
    }

