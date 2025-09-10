from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from .agent_router import route_and_execute

router = APIRouter()

class AskIn(BaseModel):
    user_id: str
    query: str
    depth: Optional[str] = None  # reserved (e.g., "deep")

@router.post("/ask")
def ask(inp: AskIn):
    res = route_and_execute(inp.user_id, inp.query)
    if not res.get("ok"):
        raise HTTPException(400, "ask failed")
    return res
