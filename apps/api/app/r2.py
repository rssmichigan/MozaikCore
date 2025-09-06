import os, boto3
from dotenv import load_dotenv
load_dotenv()

_session = boto3.session.Session()
s3 = _session.client(
    service_name="s3",
    aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
    endpoint_url=os.getenv("R2_ENDPOINT"),
)
BUCKET = os.getenv("R2_BUCKET")

def put_bytes(key: str, data: bytes, content_type="application/octet-stream"):
    s3.put_object(Bucket=BUCKET, Key=key, Body=data, ContentType=content_type)
    return {"ok": True, "key": key}
