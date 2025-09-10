from typing import Dict, Any, List

_REGISTRY = {
    "manus":  {"desc": "Skeleton planner (plan steps)"},
    "perplexity": {"desc": "Knowledge probes (search queries)"},
    "claude": {"desc": "Coherence pass"},
}

def list_agents() -> List[Dict[str, Any]]:
    return [{"name": k, **v} for k, v in _REGISTRY.items()]

def run_agent(name: str, *, user_id: str, query: str, **kw) -> Dict[str, Any]:
    if name not in _REGISTRY:
        return {"ok": False, "error": f"unknown agent '{name}'"}
    if name == "manus":
        plan = [
            f"Clarify goals for: {query}",
            "Define deliverables",
            "Draft timeline & channels",
        ]
        return {"ok": True, "output": {"plan": plan}}
    if name == "perplexity":
        probes = [
            f"{query} market analysis",
            f"{query} audience research",
            f"{query} best practices",
        ]
        return {"ok": True, "output": {"queries": probes}}
    if name == "claude":
        draft = kw.get("draft", f"Draft for: {query}")
        final = f"{draft}\n\nCoherence pass complete."
        return {"ok": True, "output": {"final": final}}
    return {"ok": True, "output": {}}
