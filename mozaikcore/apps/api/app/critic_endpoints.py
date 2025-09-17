from fastapi import APIRouter
from app.critic import simple_critic

router = APIRouter()

@router.post("/critic/eval")
def eval_answer(payload: dict):
    ans = payload.get("answer","")
    sources = payload.get("sources",[])
    c = simple_critic(ans, sources)
    return {"score": c.score, "accept": c.accept, "reason": c.reason}
