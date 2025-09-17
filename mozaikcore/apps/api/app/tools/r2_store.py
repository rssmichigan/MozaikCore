from .base import Tool, ToolSpec
from app.r2 import put_bytes
from datetime import datetime

class R2StoreTool(Tool):
    spec = ToolSpec(
        name="r2_store",
        description="Store arbitrary text bytes to R2",
        input_schema={"type":"object","properties":{"text":{"type":"string"}},"required":["text"]},
        output_schema={"type":"object","properties":{"ok":{"type":"boolean"},"key":{"type":"string"}}}
    )
    def run(self, **kwargs) -> dict:
        text = kwargs["text"]
        key = f"notes/{datetime.utcnow().isoformat()}Z.txt"
        put_bytes(key, text.encode(), "text/plain")
        return {"ok": True, "key": key}
