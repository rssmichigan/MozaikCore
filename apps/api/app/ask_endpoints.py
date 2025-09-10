from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from psycopg2.extras import Json
from datetime import datetime, timezone
import json

from app.agent_router import route_and_execute
from app.db import conn_cursor

try:
    from app.r2 import put_bytes 
except Exception:
    put_bytes = None

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

    decision_log_id = None
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
                 Json(payload)),
            )
            row = cur.fetchone()
            decision_log_id = row[0] if row else None
    except Exception:
        pass 

    final_text: Optional[str] = res.get("final")
    if not final_text:
        steps = res.get("steps") or {}
        try:
            final_text = steps.get("claude", {}).get("output", {}).get("final")
        except Exception:
            final_text = None

    answer_log_id = None
    if final_text:
        snippet = final_text[:1000] 
        try:
            with conn_cursor() as (conn, cur):
                cur.execute(
                    """
                    INSERT INTO memory_episodic(user_id, event_type, summary, data)
                    VALUES (%s,%s,%s,%s)
                    RETURNING id
                    """,
                    (inp.user_id, "answer_ready",
                     "final answer prepared",
                     Json({
                         "query": inp.query,
                         "decision": res.get("decision"),
                         "snippet": snippet,
                     })),
                )
                row = cur.fetchone()
                answer_log_id = row[0] if row else None
        except Exception:
            pass 

    trace_key = None
    if (inp.depth == "deep") and put_bytes:
        trace = res.get("trace")
        if trace is not None:
            try:
                ts = datetime.now(timezone.utc).isoformat()
                safe_uid = (inp.user_id or "anon")[:32]
                key = f"traces/{ts}-{safe_uid}.json"
                put_bytes(key, json.dumps(trace, ensure_ascii=False).encode("utf-8"), "application/json")
                trace_key = key
            except Exception:
                trace_key = None  # fail-open

    res["decision_log_id"] = decision_log_id
    res["answer_log_id"] = answer_log_id
    if trace_key:
        res["trace_key"] = trace_key
    return res
