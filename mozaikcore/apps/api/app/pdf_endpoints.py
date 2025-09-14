from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from io import BytesIO
from datetime import datetime
from app.r2 import put_bytes
from app.agents.registry import run_agent

router = APIRouter()

class PdfIn(BaseModel):
    user_id: str
    query: str
    depth: Optional[str] = "shallow"

def _build_pdf_bytes(title: str, body: str) -> bytes:
    try:
        from reportlab.lib.pagesizes import LETTER
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import inch
    except Exception as e:
        raise HTTPException(500, f"reportlab not available: {e}")

    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=LETTER)
    width, height = LETTER
    x, y = inch, height - inch

    c.setFont("Helvetica-Bold", 14)
    c.drawString(x, y, title)
    y -= 0.35*inch

    c.setFont("Helvetica", 11)
    for line in body.split("\n"):
        if y < inch:
            c.showPage()
            y = height - inch
            c.setFont("Helvetica", 11)
        c.drawString(x, y, line[:110]) 
        y -= 0.22*inch

    c.showPage()
    c.save()
    return buf.getvalue()

@router.post("/pdf/plan")
def pdf_plan(inp: PdfIn):
    manus = run_agent("manus", user_id=inp.user_id, query=inp.query)
    plan = manus.get("output", {}).get("plan", [])
    stitched = "Plan:\n- " + "\n- ".join(plan) if plan else f"Plan for: {inp.query}\n- …"
    pdf_bytes = _build_pdf_bytes(f"Mozaik Plan — {inp.query}", stitched)

    key = f"reports/{datetime.utcnow().isoformat()}Z-{inp.user_id}.pdf"
    put_bytes(key, pdf_bytes, "application/pdf")
    return {"ok": True, "key": key}
