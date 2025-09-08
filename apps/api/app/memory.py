from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.db import conn_cursor

router = APIRouter()

class ProfileIn(BaseModel):
    user_id: str
    display_name: Optional[str] = None
    prefs: Dict[str, Any] = {}

@router.post("/memory/profile/upsert")
def upsert_profile(p: ProfileIn):
    with conn_cursor() as (conn, cur):
        cur.execute("""
            INSERT INTO memory_profiles(user_id, display_name, prefs)
            VALUES (%s,%s,%s)
            ON CONFLICT (user_id) DO UPDATE
              SET display_name = EXCLUDED.display_name,
                  prefs = EXCLUDED.prefs,
                  updated_at = now()
            RETURNING user_id, display_name, prefs
        """, (p.user_id, p.display_name, p.prefs))
        row = cur.fetchone()
    return {"ok": True, "profile": {"user_id": row[0], "display_name": row[1], "prefs": row[2]}}

class EpisodicIn(BaseModel):
    user_id: str
    event_type: str
    summary: str
    data: Dict[str, Any] = {}

@router.post("/memory/episodic/log")
def log_episodic(e: EpisodicIn):
    with conn_cursor() as (conn, cur):
        cur.execute("""
            INSERT INTO memory_episodic(user_id, event_type, summary, data)
            VALUES (%s,%s,%s,%s)
            RETURNING id
        """, (e.user_id, e.event_type, e.summary, e.data))
        row = cur.fetchone()
    return {"ok": True, "id": row[0]}
