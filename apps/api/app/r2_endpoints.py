from fastapi import APIRouter, HTTPException
from app.r2 import list_objects

router = APIRouter()

@router.get("/r2/ping")
def r2_ping():
    try:
        keys = list_objects()
        return {"ok": True, "count": len(keys), "keys": keys[:10]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"r2 ping error: {e}")
