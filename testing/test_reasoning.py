"""
Test Groq reasoning engine end-to-end.
Requires GROQ_API_KEY in backend-ai/.env.
Run from project root:
    python3 testing/test_reasoning.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend-ai"))

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / "backend-ai" / ".env")

import os

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    print("❌ GROQ_API_KEY not set. Add it to backend-ai/.env")
    sys.exit(1)

from app.ai.pipeline.reasoning_engine import reasoning_engine

result = reasoning_engine.analyze(
    complaint="My manager humiliates employees during meetings and never appreciates our work.",
    employee_context={
        "department": "Engineering",
        "designation": "Software Engineer",
        "manager": "Alex Kim",
        "routingReason": "Matched leadership signals",
        "submissionType": "Concern",
    },
    similar_cases=[],
    knowledge_matches=[],
    classification={
        "category": "Leadership & Management",
        "confidence": 90.0,
    },
)

print("✅ Reasoning engine result:")
analysis = result.get("analysis", {})
print(f"  Summary: {analysis.get('executiveSummary', 'N/A')[:100]}...")
print(f"  Priority: {analysis.get('businessImpact', {}).get('priority', 'N/A')}")
print(f"  Action: {analysis.get('recommendation', {}).get('action', 'N/A')[:80]}...")
