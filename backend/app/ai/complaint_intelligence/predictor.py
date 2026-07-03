from app.ai.complaint_intelligence.tokenizer import tokenize


def predict_category(text: str) -> dict:
    tokens = set(tokenize(text))
    if {"staging", "database", "migration", "deployment"} & tokens:
        return {"category": "Developer Experience & Infrastructure", "priority": "High"}
    if {"career", "promotion", "growth", "ladder"} & tokens:
        return {"category": "Career Development & Growth", "priority": "Medium"}
    if {"overtime", "shift", "warehouse", "burnout"} & tokens:
        return {"category": "Work Environment & Safety", "priority": "High"}
    return {"category": "Operational Efficiency", "priority": "Medium"}

