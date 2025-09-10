from typing import Dict, Any, Optional, List
from .manus import ManusAgent
from .perplexity import PerplexityAgent
from .claude import ClaudeAgent

# Instantiate singletons for now
AGENTS = {
    "manus": ManusAgent(),
    "perplexity": PerplexityAgent(),
    "claude": ClaudeAgent(),
}

def list_agents() -> List[str]:
    return list(AGENTS.keys())

def get_agent(name: str):
    return AGENTS.get(name)

def run_agent(name: str, *, user_id: str, query: str, **kwargs) -> Dict[str, Any]:
    agent = get_agent(name)
    if not agent:
        return {"ok": False, "error": f"unknown agent: {name}"}
    out = agent.call(user_id=user_id, query=query, **kwargs)
    return {"ok": True, "agent": name, "output": out}
