from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from app.memory_stack import get_context, render_context

router = APIRouter()

class CtxIn(BaseModel):
    user_id: str
    query: str

@router.post("/memory/context")
def memory_context(inp: CtxIn) -> Dict[str, Any]:
    ctx = get_context(inp.user_id, inp.query)
    return {"ok": True, "context": ctx, "rendered": render_context(ctx)}
