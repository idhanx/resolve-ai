def estimate_productivity_impact(category: str) -> str:
    return "High" if "Infrastructure" in category or "Safety" in category else "Moderate"

