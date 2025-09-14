from typing import Literal

TaskType = Literal[
    "auto", "chat", "qa", "summarize", "extract", "classify",
    "rewrite", "plan", "debate", "math"
]

def classify_intent(text: str) -> TaskType:
    s = (text or "").lower()

    if any(k in s for k in ["summarize", "tl;dr", "tldr", "brief", "bullets"]):
        return "summarize"
    if any(k in s for k in ["extract", "pull", "fields", "json", "table"]):
        return "extract"
    if any(k in s for k in ["classify", "label", "category", "tag"]):
        return "classify"
    if any(k in s for k in ["rewrite", "rephrase", "improve", "edit", "tone", "style"]):
        return "rewrite"
    if any(k in s for k in ["plan", "steps", "roadmap", "timeline", "milestones"]):
        return "plan"
    if any(k in s for k in ["debate", "argue", "pros and cons", "counter"]):
        return "debate"
    if any(k in s for k in ["solve", "math", "equation", "calculate", "calc", "sum", "integral"]):
        return "math"
    if any(k in s for k in ["who", "what", "when", "where", "why", "how", "?"]):
        return "qa"

    return "chat"