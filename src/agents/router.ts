import { Agent, AgentInput, AgentResult } from "./types"
export const RouterAgent: Agent = {
  name: "router",
  async run(input: AgentInput): Promise<AgentResult> {
    const g = input.goal.toLowerCase()
    const route =
      g.includes("research") || g.startsWith("find ") || g.includes("look up") ? "research" :
      g.includes("build") || g.includes("implement") || g.includes("code")    ? "build" :
      "reply"
    return { role: "router", content: `route:${route}`, data: { route } }
  }
}