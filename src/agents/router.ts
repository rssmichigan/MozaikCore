import { Agent, AgentInput, AgentResult } from "./types"
import { llm } from "./llm"

export const RouterAgent: Agent = {
  name: "router",
  async run(input: AgentInput): Promise<AgentResult> {
    const mode = (input.context as any)?.mode as string | undefined
    if (mode === "research") return { role:"router", content:"", data:{ route:"research" } }
    if (mode === "agents" || mode === "scaffold" || mode === "build")
      return { role:"router", content:"", data:{ route:"build" } }

    const q = `Classify the user's request into one of: research | build | reply
Return ONLY the label (no extra text).
User: ${input.goal}`
    const r = await llm(q)
    const label = (r ?? "").trim().toLowerCase()
    const route = (label === "research" || label === "build" || label === "reply") ? label : "reply"
    return { role:"router", content:"", data:{ route } }
  }
}
