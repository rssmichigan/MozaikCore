from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.db import conn_cursor

router = APIRouter()

class SacIn(BaseModel):
    user_id: str
    title: str
    notes: Optional[str] = None
    happened_at: Optional[str] = None 

@router.post("/sacrifice/log")
def sacrifice_log(inp: SacIn):
    with conn_cursor() as (conn, cur):
        cur.execute("""
            INSERT INTO sacrifices(user_id, title, notes, happened_at)
            VALUES (%s,%s,%s,COALESCE(%s, now()))
            RETURNING id
        """, (inp.user_id, inp.title, inp.notes, inp.happened_at))
        row = cur.fetchone()
    return {"ok": True, "id": row[0]}

@router.get("/sacrifice/list")
def sacrifice_list(user_id: str, k: int = 20):
    with conn_cursor() as (conn, cur):
        cur.execute("""
            SELECT id, title, notes, happened_at
            FROM sacrifices
            WHERE user_id = %s
            ORDER BY happened_at DESC
            LIMIT %s
        """, (user_id, k))
        rows = cur.fetchall()
    out = [{"id": r[0], "title": r[1], "notes": r[2], "happened_at": r[3].isoformat()} for r in rows]
    return {"ok": True, "items": out}
