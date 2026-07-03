from app.ai.complaint_intelligence.inference import analyze_complaint


def test_analyze_complaint_routes_infrastructure():
    result = analyze_complaint(
        "Staging database issue",
        "Database migrations are failing",
        "Technology",
        "Concern",
    )
    assert result["ai_category"] == "Developer Experience & Infrastructure"
    assert result["assigned_executive"] == "CTO"

