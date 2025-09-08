import os
import boto3
from botocore.config import Config
from dotenv import load_dotenv
load_dotenv()

R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_ENDPOINT = os.getenv("R2_ENDPOINT")
BUCKET = os.getenv("R2_BUCKET")

_cfg = Config(connect_timeout=5, read_timeout=5, retries={'max_attempts': 2, 'mode': 'standard'})

def _ensure_env():
    missing = [k for k,v in {
        'R2_ACCESS_KEY_ID': R2_ACCESS_KEY_ID,
        'R2_SECRET_ACCESS_KEY': R2_SECRET_ACCESS_KEY,
        'R2_ENDPOINT': R2_ENDPOINT,
        'R2_BUCKET': BUCKET,
    }.items() if not v]
    if missing:
        raise RuntimeError(f"R2 env missing: {', '.join(missing)}")

def get_s3():
    _ensure_env()
    session = boto3.session.Session()
    return session.client(
        service_name='s3',
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        endpoint_url=R2_ENDPOINT,
        config=_cfg,
    )

def put_bytes(key: str, data: bytes, content_type='application/octet-stream'):
    s3 = get_s3()
    s3.put_object(Bucket=BUCKET, Key=key, Body=data, ContentType=content_type)
    return {'ok': True, 'key': key}

def list_objects():
    s3 = get_s3()
    resp = s3.list_objects_v2(Bucket=BUCKET)
    return [o['Key'] for o in resp.get('Contents', [])]
