from dataclasses import dataclass
from typing import Callable, Optional

@dataclass
class Skill:
    name: str
    description: str
    system: Optional[str] = None  # extra guardrails/instructions

SKILLS = {
    "chat": Skill(
        name="chat",
        description="General conversation, reasoning, explanation, Socratic dialogue.",
        system="Be helpful, neutral, concise. Show reasoning structure in plain language, not chain-of-thought."
    ),
    "qa": Skill(
        name="qa",
        description="Answer questions using provided context if available; cite sources.",
        system="If context is provided, answer only from it and include a Sources section with [doc-id]. If insufficient, say so."
    ),
    "summarize": Skill(
        name="summarize",
        description="Summarize text into bullets with key points and action items."
    ),
    "extract": Skill(
        name="extract",
        description="Extract structured fields (entities, dates, tasks) in JSON."
    ),
    "classify": Skill(
        name="classify",
        description="Categorize or label text by schema."
    ),
    "rewrite": Skill(
        name="rewrite",
        description="Rewrite text for tone/clarity/length while preserving meaning."
    ),
    "plan": Skill(
        name="plan",
        description="Break a goal into steps with owners, timelines, risks."
    ),
    "debate": Skill(
        name="debate",
        description="Present for/against positions, steelman both sides, conclude with evidence-based stance."
    ),
    "math": Skill(
        name="math",
        description="Do step-by-step calculation with explicit final answer line."
    ),
    "code": Skill(
        name="code",
        description="Explain or draft small code snippets; when unsure, state limits."
    ),
}