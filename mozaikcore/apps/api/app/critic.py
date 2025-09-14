from dataclasses import dataclass
from typing import List

@dataclass
class Critique:
    score: float
    accept: bool
    reason: str

def simple_critic(answer: str, sources: List[str]) -> Critique:
    # Penalize missing citation when sources provided
    missing_cite = bool(sources) and ("[" not in answer and "http" not in answer)
    score = 0.5 if missing_cite else 0.8
    return Critique(score=score, accept=(score>=0.6), reason=("missing citation" if missing_cite else "ok"))
