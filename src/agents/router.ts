import { Agent, AgentInput, AgentResult } from "./types"
import { llm } from "./llm"

function heuristic(goal: string): "research" | "build" | "direct" {
  const g = goal.toLowerCase()
  if (g.startsWith("apply agents") || g.includes("apply agents")) return "build"
  if (g.includes("scaffold") || g.includes("plan") || g.includes("implementation") || g.includes("how would you implement") || g.includes("build")) return "build"
  if (g.includes("research") || g.startsWith("research") || g.includes("look up") || g.includes("compare") || g.includes("analyze")) return "research"
  return "direct"
}

export const RouterAgent: Agent = {
  name: "router",
  async run(input: AgentInput): Promise<AgentResult> {
    const mode = (input as any)?.context?.mode as string | undefined
    if (mode === "research") return { role: "router", content: "", data: { route: "research" } }
    if (mode === "agents")   return { role: "router", content: "", data: { route: "build" } }

    const goal = input.goal || ""
    let route: "research" | "build" | "direct" = heuristic(goal)

    if (route === "direct") {
      try {
        const cls = await llm(
`Classify the user's goal into one of: research | build | direct.
User goal: """${goal}"""
Return only one word: research, build, or direct.`
        )
        const label = (cls || "").trim().toLowerCase()
        if (label === "research") route = "research"
        else if (label === "build") route = "build"
        else route = "direct"
      } catch {
        route = heuristic(goal)
      }
    }

    return { role: "router", content: "", data: { route: route === "direct" ? "reply" : route } }
  }
}
