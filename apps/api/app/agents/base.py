from typing import Dict, Any, Optional
from pydantic import BaseModel

class AgentSpec(BaseModel):
    name: str
    description: str
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]

class Agent:
    spec: AgentSpec

    # Minimal universal signature; concrete agents can accept more kwargs
    def call(self, *, user_id: str, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Execute the agent with a minimal contract. This is intentionally simple
        for day-12 scaffolding; agent_loop will orchestrate richer flows later.
        """
        raise NotImplementedError("Agents must implement call()")
