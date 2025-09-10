from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from psycopg2.extras import Json
from app.agent_router import route_and_execute
from app.db import conn_cursor

router = APIRouter()

class AskIn(BaseModel):
    user_id: str
    query: str
    depth: Optional[str] = None 

@router.post("/ask")
def ask(inp: AskIn):
    res = route_and_execute(inp.user_id, inp.query)
    if not res.get("ok"):
        raise HTTPException(400, "ask failed")

    log_id = None
    try:
        payload = {
            "query": inp.query,
            "decision": res.get("decision"),
            "reasons": res.get("reasons", []),
        }
        with conn_cursor() as (conn, cur):
            cur.execute(
                """
                INSERT INTO memory_episodic(user_id, event_type, summary, data)
                VALUES (%s,%s,%s,%s)
                RETURNING id
                """,
                (inp.user_id, "router_decision",
                 f"ask routed as {res.get('decision') or 'loop'}",
                 Json(payload))
            )
            row = cur.fetchone()
            log_id = row[0] if row else None
    except Exception:
        pass

    res["log_id"] = log_id
    return res
