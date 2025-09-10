from typing import Dict, Any
from .agents.registry import run_agent

class AgentLoop:
    """
    Minimal orchestrator:
      1) Manus → skeleton plan
      2) Perplexity → knowledge probes
      3) Claude → coherence pass over a stitched draft
    Later we’ll inject memory reads/writes and tool calls.
    """
    def run(self, *, user_id: str, query: str) -> Dict[str, Any]:
        # 1) skeleton plan
        plan_res = run_agent("manus", user_id=user_id, query=query)
        plan = plan_res.get("output", {}).get("plan", [])

        # 2) knowledge probes
        k_res = run_agent("perplexity", user_id=user_id, query=query)
        probes = k_res.get("output", {}).get("queries", [])

        # 3) coherence pass from Claude
        stitched = "Plan:\n- " + "\n- ".join(plan) + "\n\nKnowledge probes:\n- " + "\n- ".join(probes)
        c_res = run_agent("claude", user_id=user_id, query=query, draft=stitched)

        return {
            "ok": True,
            "steps": {
                "manus": plan_res,
                "perplexity": k_res,
                "claude": c_res,
            }
        }
