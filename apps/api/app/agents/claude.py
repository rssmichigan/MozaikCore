from typing import Dict, Any, Optional
from .base import Agent, AgentSpec

class ClaudeAgent(Agent):
    spec = AgentSpec(
        name="claude",
        description="Coherence/critique stub — improves/assesses a draft answer.",
        input_schema={
            "type": "object",
            "properties": {
                "user_id": {"type":"string"},
                "query": {"type":"string"},
                "draft": {"type":"string"}
            },
            "required": ["user_id", "query"]
        },
        output_schema={
            "type": "object",
            "properties": {
                "improved": {"type":"string"},
                "score": {"type":"number"},
                "reasons": {"type":"array", "items":{"type":"string"}}
            }
        }
    )

    def call(self, *, user_id: str, query: str, context: Optional[Dict[str, Any]]=None, draft: Optional[str]=None) -> Dict[str, Any]:
        # Minimal coherence “pass” — later we’ll wire the critic & memory web.
        draft = draft or f"Initial thought on: {query}"
        reasons = [
            "Checks clarity",
            "Checks missing citation",
            "Checks contradictions",
        ]
        improved = f"[Improved for {user_id}] {draft}"
        return {"improved": improved, "score": 0.7, "reasons": reasons}
