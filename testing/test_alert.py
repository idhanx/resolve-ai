"""
Test escalation alert grouping logic.
Run from project root:
    python3 testing/test_alert.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend-ai"))

from app.api.routes.alerts import _is_unresolved, _risk_score, _build_alert


# Test status detection
assert _is_unresolved("pending review") is True
assert _is_unresolved("Submitted") is True
assert _is_unresolved("Resolved") is False
assert _is_unresolved("Verified") is False
print("✅ Status detection: OK")

# Test risk score
score_2 = _risk_score(2, 85.0)
score_5 = _risk_score(5, 90.0)
assert 85 <= score_2 <= 90
assert 85 <= score_5 <= 90
print(f"✅ Risk scoring: 2 issues → {score_2}%, 5 issues → {score_5}%")

# Test alert building with mock complaints
from unittest.mock import MagicMock

complaint1 = MagicMock()
complaint1.department = "Technology"
complaint1.category = "Developer Experience & Infrastructure"
complaint1.confidence = 92.0
complaint1.business_impact = "Deployment delays affect product delivery."
complaint1.executive_summary = "Staging DB is blocking CI/CD pipeline."
complaint1.recommendation = "Rebuild staging replication pipeline."

complaint2 = MagicMock()
complaint2.department = "Technology"
complaint2.category = "Developer Experience & Infrastructure"
complaint2.confidence = 88.0
complaint2.business_impact = "Same infrastructure bottleneck."
complaint2.executive_summary = "Another deployment failure."
complaint2.recommendation = "Expand staging server capacity."

alert = _build_alert([complaint1, complaint2])
assert alert["issue_count"] == 2
assert alert["department"] == "Technology"
assert alert["assigned_executive"] == "CTO"
print(f"✅ Alert building: {alert['issue_count']} issues → risk {alert['risk_score']}% ({alert['severity']})")

print("\n✅ All alert tests passed.")
