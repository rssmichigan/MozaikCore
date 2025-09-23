import { AgentInput, AgentResult } from "./types"
import { RouterAgent } from "./router"
import { ResearchAgent } from "./research"
import { BuilderAgent } from "./builder"
import { SynthAgent } from "./synth"
import { llm } from "./llm"

export async function runAgents(input: AgentInput): Promise<AgentResult[]> {
  const results: AgentResult[] = []
  const route = (await RouterAgent.run(input)).data?.route as "research" | "build" | "reply" | undefined

  if (route === "research") {
    const r = await ResearchAgent.run(input)
    results.push(r)
    const s = await SynthAgent.run({ ...input, context: { ...(input.context ?? {}), latest: r.content } })
    results.push(s)
    return results
  }

  if (route === "build") {
    const b = await BuilderAgent.run(input)
    results.push(b)
    const s = await SynthAgent.run({ ...input, context: { ...(input.context ?? {}), latest: b.content } })
    results.push(s)
    return results
  }

  const direct = await llm(
`You are Mozaik.
Return a single, precise answer with no preamble.
If the request is ambiguous, ask one clarifying question in <= 1 sentence.
User: ${input.goal}`
  )
  const withOffer = (direct ?? "").trim() + "\n\nNeed a deeper breakdown or sources? Reply \"elaborate\"."
  results.push({ role: "reply", content: withOffer })
  return results
}
