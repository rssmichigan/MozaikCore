import { Agent, AgentInput, AgentResult } from "./types";

export const RouterAgent: Agent = {
  name: "router",
  async run(input: AgentInput): Promise<AgentResult> {
    const goal = (input.goal || "").toLowerCase();
    const mode = (input as any)?.context?.mode as string | undefined;

    // hard decisions first
    if (mode === "research") return { role: "router", content: "", data: { route: "research" } };
    if (mode === "agents")   return { role: "router", content: "", data: { route: "build" } };

    // soft heuristics
    if (goal.startsWith("apply agents:") || goal.includes("apply agents")) {
      return { role: "router", content: "", data: { route: "build" } };
    }
    if (goal.includes("research") || goal.startsWith("research")) {
      return { role: "router", content: "", data: { route: "research" } };
    }
    // default
    return { role: "router", content: "Direct reply route (stub)", data: { route: "reply" } };
  }
};
