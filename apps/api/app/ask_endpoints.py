from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from typing import List
import logging

from app.factuality import grounding_score, collect_memory_evidence
import os
_MIN = float(os.getenv("FACTUALITY_MIN_SCORE", "0.70"))

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
    no_fact: bool = False
    user_id: str
    query: str
    depth: Optional[str] = None
    sources: List[str] = []
    force_best_effort: bool = False
    selected_action: Optional[str] = None  # 'deep' | 'force' 

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
    # --- factuality compute (always) ---
    try:
        # ensure `res["final"]` is present if we built final_text
        if (locals().get("final_text") is not None) and not res.get("final"):
            res["final"] = final_text

        text = (res.get("final") or locals().get("final_text") or "") or ""
        mem_rows = collect_memory_evidence(inp.user_id, (inp.query or text), 5)
        score, meta = grounding_score(text, [], mem_rows)
        abstain = (score is not None and score < _MIN)
    except Exception:
        score, meta, abstain = None, {}, None

    # --- abstention UX & learning ---
    explanation = None
    clarifying_questions = None
    forced = False

    if abstain and not inp.force_best_effort:
        explanation = "I can answer, but I prefer to clarify first to keep accuracy high."
        clarifying_questions = [
            "Is this for personal learning or professional work?",
            "Should I run a deeper pass with external sources?",
            "Do you want a brief outline or a detailed plan?"
        ]
    elif abstain and inp.force_best_effort:
        forced = True
        abstain = False
        res["final"] = (text or "") + "\n\n[Note: best-effort draft; limited verification.]"

    # attach factuality & UX hints to response
    res["factuality"] = {
        "score": score,
        "abstain": abstain,
        "forced": forced,
        "warning": locals().get("warning"),
        "details": meta
    }
    if explanation is not None:
        res["explanation"] = explanation
    if clarifying_questions is not None:
        res["clarifying_questions"] = clarifying_questions

    # attach factuality
    if "factuality" not in res:
        res["factuality"] = {"score": score, "abstain": abstain, "details": meta}
    # --- user-selected action (learning) ---
    try:
        if inp.selected_action:
            with conn_cursor() as (conn, cur):
                cur.execute(
                    """
                    INSERT INTO memory_episodic(user_id, event_type, summary, data)
                    VALUES (%s,%s,%s,%s)
                    """,
                    (inp.user_id, "user_action",
                     f"ask: user selected {inp.selected_action}",
                     Json({"query": inp.query, "selected_action": inp.selected_action,
                           "has_sources": bool(inp.sources)})),
                )
    except Exception:
        pass
    
    return res
