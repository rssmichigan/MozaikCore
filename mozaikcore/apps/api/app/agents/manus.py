from typing import Dict, Any, Optional
from .base import Agent, AgentSpec

class ManusAgent(Agent):
    spec = AgentSpec(
        name="manus",
        description="Planner/structurer of tasks — produces a skeletal plan from a query.",
        input_schema={
            "type": "object",
            "properties": {
                "user_id": {"type":"string"},
                "query": {"type":"string"}
            },
            "required": ["user_id", "query"]
        },
        output_schema={
            "type": "object",
            "properties": {
                "plan": {"type":"array", "items":{"type":"string"}},
                "notes": {"type":"string"}
            }
        }
    )

    def call(self, *, user_id: str, query: str, context: Optional[Dict[str, Any]]=None) -> Dict[str, Any]:
        # Stubbed “skeleton plan” — day-12 spine will wire in deeper logic
        steps = [
            f"Clarify objective for user {user_id}",
            f"Identify 3–5 subgoals related to: {query}",
            "Draft timeline and required resources",
            "Flag dependencies & risk points",
        ]
        return {"plan": steps, "notes": "Stub plan (Manus). Replace with real planner later."}
