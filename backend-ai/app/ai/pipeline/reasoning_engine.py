"""
Echo AI Reasoning Engine

Workflow

Employee Complaint
        │
        ▼
JarvisLabs DistilBERT
        │
        ▼
Category + Confidence
        │
        ▼
Groq LLM
        │
        ▼
Enterprise Analysis
"""

import json
from typing import Any, Dict

from groq import Groq

from app.core.config import get_settings
from app.ai.complaint_intelligence.predictor import ComplaintPredictor
from app.ai.pipeline.prompt import PromptBuilder


class ReasoningEngine:

    def __init__(self):

        settings = get_settings()

        self.predictor = ComplaintPredictor()

        self.client = Groq(
            api_key=settings.GROQ_API_KEY
        )

        self.model = settings.GROQ_MODEL

    # -------------------------------------------------------
    # Main AI Pipeline
    # -------------------------------------------------------

    def analyze(
        self,
        complaint: str,
        employee_context: Dict[str, Any] = None,
        similar_cases=None,
        knowledge_matches=None,
        classification: Dict[str, Any] | None = None,
    ):

        if employee_context is None:
            employee_context = {}

        if similar_cases is None:
            similar_cases = []

        if knowledge_matches is None:
            knowledge_matches = []

        # -----------------------------------------
        # STEP 1
        # Complaint Classification
        # -----------------------------------------

        prediction = classification or self.predictor.predict(
            complaint
        )

        category = prediction["category"]

        confidence = prediction["confidence"]

        # -----------------------------------------
        # STEP 2
        # Confidence Validation
        # -----------------------------------------

        confidence_level = self._confidence_level(
            confidence
        )

        # -----------------------------------------
        # STEP 3
        # Build Enterprise Prompt
        # -----------------------------------------

        prompt = PromptBuilder.build(

            complaint=complaint,

            category=category,

            confidence=confidence,

            employee_context=employee_context,

            similar_cases=similar_cases,

            knowledge_matches=knowledge_matches,
        )

        # -----------------------------------------
        # STEP 4
        # Call Groq
        # -----------------------------------------

        response = self.client.chat.completions.create(

            model=self.model,

            temperature=0.2,

            response_format={
                "type": "json_object"
            },

            messages=[

                {
                    "role": "system",
                    "content": (
                        "You are Echo AI, an Enterprise HR Investigation Assistant."
                    )
                },

                {
                    "role": "user",
                    "content": prompt
                }

            ]

        )

        raw_response = response.choices[0].message.content

        # -----------------------------------------
        # STEP 5
        # Parse LLM Response
        # -----------------------------------------

        try:

            analysis = json.loads(raw_response)

        except Exception:

            analysis = {

                "evidence": {
                    "strength": "Unknown",
                    "reason": "Unable to parse AI response."
                },

                "businessImpact": {
                    "priority": "Medium",
                    "financialRisk": "Unknown",
                    "reputationRisk": "Unknown",
                    "productivityImpact": "Unknown",
                    "retentionRisk": "Unknown",
                    "reason": "AI parsing failed."
                },

                "recommendation": {
                    "action": "Manual HR Review",
                    "owner": "HR Team",
                    "timeline": "Immediate",
                    "reason": "Fallback recommendation."
                },

                "alerts": {
                    "severity": "Medium",
                    "notify": [
                        "HR Head"
                    ],
                    "reason": "AI response parsing failed."
                },

                "executiveSummary":
                "The complaint requires manual review because AI response could not be interpreted.",

                "policyEvidence": self._policy_evidence_summary(
                    knowledge_matches
                )

            }

        analysis.setdefault(
            "policyEvidence",
            self._policy_evidence_summary(
                knowledge_matches
            )
        )

        # -----------------------------------------
        # STEP 6
        # Final Response
        # -----------------------------------------

        return {

            "complaint": {

                "text": complaint,

                "category": category,

                "confidence": confidence,

                "confidenceLevel": confidence_level

            },

            "analysis": analysis

        }

    # -------------------------------------------------------
    # Confidence Helper
    # -------------------------------------------------------

    def _confidence_level(self, confidence):

        confidence = float(confidence)

        if confidence >= 90:
            return "Very High"

        if confidence >= 75:
            return "High"

        if confidence >= 60:
            return "Medium"

        return "Low"

    def _policy_evidence_summary(
        self,
        knowledge_matches
    ):
        return [
            {
                "citation": item.get("citation", item.get("id", "Knowledge source")),
                "howItApplies": item.get("content", "")[:240]
            }
            for item in knowledge_matches[:3]
        ]


# -------------------------------------------------------
# Singleton
# -------------------------------------------------------

reasoning_engine = ReasoningEngine()
