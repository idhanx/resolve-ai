"""
Test DistilBERT complaint predictor.
Requires AI_SERVICE_URL in backend-ai/.env pointing to a running classifier.
Run from project root:
    python3 testing/test_predictor.py

Note: Backend falls back gracefully if AI_SERVICE_URL is unavailable.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend-ai"))

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / "backend-ai" / ".env")

from app.ai.complaint_intelligence.predictor import ComplaintPredictor

predictor = ComplaintPredictor()

try:
    result = predictor.predict(
        "My manager humiliates employees during meetings and never appreciates our work."
    )
    print(f"✅ Prediction: {result}")
except Exception as e:
    print(f"⚠️  Predictor unavailable (expected if AI_SERVICE_URL is not running):")
    print(f"   {e}")
    print("   Backend will use keyword-based routing as fallback.")
