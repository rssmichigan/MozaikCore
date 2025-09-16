import { Agent, AgentInput, AgentResult } from "./types"
import { llm } from "./llm"

export const BuilderAgent: Agent = {
  name: "builder",
  async run(input: AgentInput): Promise<AgentResult> {
    const spec = await llm(
      `Create an implementation plan for: ${input.goal}.
Return files to create, APIs, data models, and acceptance tests.`
    )
    return { role: "builder", content: spec }
  }
}