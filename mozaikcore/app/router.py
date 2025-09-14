import os
from typing import Literal, Optional
from app.pii import redact
from app.rag import retrieve, build_context
from app.intent import classify_intent
from app.skills import SKILLS
from app.llm_backend import generate  

DEFAULT_GEN_MODEL = os.getenv("GEN_MODEL", "gpt-4o-mini")  
BASE_TEMPERATURE = float(os.getenv("GEN_TEMPERATURE", "0.3"))

BASE_LIMITS = {
    "max_tokens": int(os.getenv("GEN_MAX_TOKENS", "320")), 
    "num_ctx": int(os.getenv("GEN_NUM_CTX", "4096")),       
}

TaskType = Literal["auto","chat","qa","summarize","extract","classify","rewrite","plan","debate","math","code"]

def _limits_for(intent: str) -> dict:
    limits = dict(BASE_LIMITS)
    if intent in ("summarize","debate","plan"): limits["max_tokens"] = min(400, limits["max_tokens"])
    if intent in ("extract","classify"): limits["max_tokens"] = min(220, limits["max_tokens"])
    return limits

def complete(task: TaskType, query: str, privacy: Literal["low","high"]="low", use_rag: bool=True, system: Optional[str]=None) -> dict:
    intent = classify_intent(query) if task == "auto" else task
    user_text = redact(query) if privacy == "high" else query
    citations, context = [], ""

    if use_rag and intent in ("qa","summarize","extract","classify","rewrite","plan","debate"):
        hits = retrieve(user_text, k=2)
        if hits:
            context = build_context(hits)
            citations = [h["id"] for h in hits]

    sys = system or (SKILLS.get(intent, SKILLS["chat"]).system or "You are MozaikCore. Be helpful, neutral, and concise.")
    rules = [
        f"Skill: {intent}",
        "Keep answers concise; avoid exceeding ~180 words unless asked.",
        "If you use Context, include a 'Sources:' section listing [doc-id].",
        "If info is insufficient, say so and ask for the minimum missing detail."
    ]
    if intent == "extract": rules.append("Return JSON only, no prose.")
    if intent == "plan": rules.append("Return: Goal, Assumptions, Steps (numbered), Risks, Next action.")
    if intent == "debate": rules.append("Return: For, Against, Synthesis, Conclusion.")
    if intent == "math": rules.append("Show steps then 'Final:' with the numeric answer.")

    prompt = (
        f"User:\n{user_text}\n\n"
        f"Context (may be empty):\n{context}\n\n"
        f"Instructions:\n- " + "\n- ".join(rules)
    )
    messages = [{"role":"system","content": sys}, {"role":"user","content": prompt}]

    limits = _limits_for(intent)
    answer = generate(
        messages,
        model=DEFAULT_GEN_MODEL,
        temperature=BASE_TEMPERATURE,
        max_tokens=limits["max_tokens"],
        timeout=60
    )
    return {"answer": answer, "citations": citations, "intent": intent}
