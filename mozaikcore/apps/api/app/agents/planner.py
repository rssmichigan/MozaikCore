from typing import List, Dict

def plan(user_goal: str) -> List[Dict]:
    """
    Naive plan: search first, then answer.
    """
    return [
        {"step": 1, "tool": "web_search", "args": {"query": user_goal}},
        {"step": 2, "tool": "generate", "args": {"prompt": user_goal}}
    ]
