from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from .agents.registry import list_agents, run_agent
from .agent_loop import AgentLoop

router = APIRouter()

class RunIn(BaseModel):
    name: str
    user_id: str
    query: str
    extra: Optional[Dict[str, Any]] = None

class LoopIn(BaseModel):
    user_id: str
    query: str

@router.get("/agents/list")
def agents_list():
    return {"ok": True, "agents": list_agents()}

@router.post("/agents/run")
def agents_run(inp: RunIn):
    res = run_agent(inp.name, user_id=inp.user_id, query=inp.query, **(inp.extra or {}))
    if not res.get("ok"):
        raise HTTPException(404, res.get("error", "unknown agent"))
    return res

@router.post("/agents/loop")
def agents_loop(inp: LoopIn):
    loop = AgentLoop()
    return loop.run(user_id=inp.user_id, query=inp.query)
