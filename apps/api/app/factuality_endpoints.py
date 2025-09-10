from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.factuality import grounding_score, collect_memory_evidence

router = APIRouter()

class FactualityIn(BaseModel):
    user_id: str
    answer: str
    query: Optional[str] = None
    sources: List[str] = []
    min_score: float = 0.5   # override threshold if desired
    use_memory: bool = True
    top_k: int = 5

@router.post("/factuality/eval")
def factuality_eval(inp: FactualityIn):
    memory_rows = collect_memory_evidence(inp.user_id, inp.query or inp.answer, inp.top_k) if inp.use_memory else []
    score, meta = grounding_score(inp.answer, inp.sources, memory_rows)
    abstain = score < inp.min_score
    return {"ok": True, "score": score, "abstain": abstain, "details": meta}
