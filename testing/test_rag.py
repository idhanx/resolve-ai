"""
Test RAG retrieval service.
Run from backend-ai directory:
    python3 ../testing/test_rag.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend-ai"))

from app.ai.rag_service import rag_service

cases = rag_service.retrieve_similar_cases(
    complaint="My manager humiliates employees and never appreciates them.",
    category="Leadership",
)

print(f"Found {len(cases)} matches:")
for case in cases:
    print(f"  [{case['score']}] {case['citation']}")

print()
print("RAG Context:")
print(rag_service.build_rag_context(cases))
