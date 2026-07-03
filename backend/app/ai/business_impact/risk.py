def estimate_overall_risk(category: str) -> str:
    return "High" if category in {"Developer Experience & Infrastructure", "Work Environment & Safety"} else "Medium"

