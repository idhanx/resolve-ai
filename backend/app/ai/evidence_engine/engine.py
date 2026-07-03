from app.ai.evidence_engine.scoring import score_evidence
from app.ai.evidence_engine.validator import validate_evidence


def build_evidence_summary(evidence_items: list[str]) -> dict:
    valid = validate_evidence(evidence_items)
    return {
        "valid": valid,
        "score": score_evidence(evidence_items) if valid else 0,
        "items": evidence_items,
    }

