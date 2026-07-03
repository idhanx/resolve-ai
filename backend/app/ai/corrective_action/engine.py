from app.ai.corrective_action.decision import choose_action


def recommend_corrective_action(category: str) -> dict:
    action = choose_action(category)
    return {
        "action_type": action,
        "summary": "Deterministic placeholder recommendation for the initial backend scaffold.",
    }

