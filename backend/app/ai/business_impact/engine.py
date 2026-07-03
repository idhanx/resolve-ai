from app.ai.business_impact.financial_loss import estimate_financial_loss
from app.ai.business_impact.productivity import estimate_productivity_impact
from app.ai.business_impact.reputation import estimate_reputation_risk
from app.ai.business_impact.risk import estimate_overall_risk


def assess_business_impact(category: str) -> dict:
    return {
        "financial_loss": estimate_financial_loss(category),
        "reputation": estimate_reputation_risk(category),
        "productivity": estimate_productivity_impact(category),
        "risk": estimate_overall_risk(category),
    }

