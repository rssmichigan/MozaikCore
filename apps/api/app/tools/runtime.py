from fastapi import APIRouter, HTTPException
from app.tools.r2_store import R2StoreTool

router = APIRouter()
TOOLS = {"r2_store": R2StoreTool()}

@router.post("/tools/run/{name}")
def run_tool(name: str, payload: dict):
    tool = TOOLS.get(name)
    if not tool:
        raise HTTPException(404, f"tool {name} not found")
    return tool.run(**payload)
