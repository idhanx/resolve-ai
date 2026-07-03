from app.ai.complaint_intelligence.client import client

class ComplaintPredictor:

    def predict(self, complaint: str):

        result = client.predict(complaint)

        return {
            "category": result["category"],
            "confidence": result["confidence"]
        }