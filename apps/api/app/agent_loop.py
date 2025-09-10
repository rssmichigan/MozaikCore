from typing import Dict, Any
from .agents.registry import run_agent

class AgentLoop:
    def run(self, *, user_id: str, query: str) -> Dict[str, Any]:
        manus = run_agent("manus", user_id=user_id, query=query)
        k = run_agent("perplexity", user_id=user_id, query=query)
        plan = manus.get("output", {}).get("plan", [])
        probes = k.get("output", {}).get("queries", [])
        stitched = "Plan:\n- " + "\n- ".join(plan) + "\n\nKnowledge probes:\n- " + "\n- ".join(probes)
        claude = run_agent("claude", user_id=user_id, query=query, draft=stitched)
        return {"ok": True, "steps": {"manus": manus, "perplexity": k, "claude": claude}}
