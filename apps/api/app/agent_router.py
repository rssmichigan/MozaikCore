from typing import Dict, Any
import re
from .agents.registry import run_agent
from .agent_loop import AgentLoop

def _norm(q: str) -> str:
    return re.sub(r"\s+", " ", q.lower()).strip()

def route_and_execute(user_id: str, query: str) -> Dict[str, Any]:
    q = _norm(query)
    reasons = []
    decision = "loop"

    if any(k in q for k in ["research", "source", "market", "compare", "best", "data"]):
        decision = "research_and_cohere"
        reasons.append("query indicates external knowledge gathering")
    if any(k in q for k in ["plan", "steps", "roadmap", "timeline", "how to"]):
        # if both research and plan hit, keep loop (broader coverage)
        if decision == "research_and_cohere":
            decision = "loop"
            reasons.append("needs both planning and research → loop")
        else:
            decision = "plan_and_cohere"
            reasons.append("query indicates structured planning")
    if len(q) >= 120 or any(k in q for k in ["why", "how", "explain", "strategy"]):
        decision = "loop"
        reasons.append("complex/long prompt → loop")

    if decision == "plan_and_cohere":
        manus = run_agent("manus", user_id=user_id, query=query)
        stitched = "Plan:\n- " + "\n- ".join(manus.get("output", {}).get("plan", []))
        claude = run_agent("claude", user_id=user_id, query=query, draft=stitched)
        return {"ok": True, "decision": decision, "reasons": reasons, "trace": {"manus": manus, "claude": claude},
                "final": claude.get("output", {}).get("final", stitched)}

    if decision == "research_and_cohere":
        p = run_agent("perplexity", user_id=user_id, query=query)
        stitched = "Knowledge probes:\n- " + "\n- ".join(p.get("output", {}).get("queries", []))
        claude = run_agent("claude", user_id=user_id, query=query, draft=stitched)
        return {"ok": True, "decision": decision, "reasons": reasons, "trace": {"perplexity": p, "claude": claude},
                "final": claude.get("output", {}).get("final", stitched)}

    loop = AgentLoop().run(user_id=user_id, query=query)
    final = loop.get("steps", {}).get("claude", {}).get("output", {}).get("final")
    return {"ok": True, "decision": decision, "reasons": reasons, "trace": loop.get("steps", {}), "final": final}
