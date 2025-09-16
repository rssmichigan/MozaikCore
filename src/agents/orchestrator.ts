import { AgentInput, AgentResult } from "./types"
import { RouterAgent } from "./router"
import { ResearchAgent } from "./research"
import { BuilderAgent } from "./builder"
import { SynthAgent } from "./synth"

export async function runAgents(input: AgentInput): Promise<AgentResult[]> {
  const results: AgentResult[] = []
  const route = (await RouterAgent.run(input)).data?.route
  if (route === "research") results.push(await ResearchAgent.run(input))
  else if (route === "build") results.push(await BuilderAgent.run(input))
  else results.push({ role: "reply", content: "Direct reply route (stub)" })
  results.push(await SynthAgent.run({ ...input }))
  return results
}