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

@router.get("/r2/list")
def r2_list():
    keys = list_objects()
    return {"ok": True, "count": len(keys), "keys": keys}

from fastapi.responses import StreamingResponse
from botocore.exceptions import ClientError
from app.r2 import get_s3, BUCKET

@router.get("/r2/get")
def r2_get(key: str):
    s3 = get_s3()
    try:
        obj = s3.get_object(Bucket=BUCKET, Key=key)
        body = obj["Body"]
        ct = obj.get("ContentType", "application/octet-stream")
        return StreamingResponse(
            body,
            media_type=ct,
            headers={"Content-Disposition": f"inline; filename=\"{key.split('/')[-1]}\""}
        )
    except ClientError:
        raise HTTPException(status_code=404, detail=f"object not found: {key}")
