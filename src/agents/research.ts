import { Agent, AgentInput, AgentResult } from "./types"
import { llm } from "./llm"

export const ResearchAgent: Agent = {
  name: "research",
  async run(input: AgentInput): Promise<AgentResult> {
    const draft = await llm(
      `Research summary for: ${input.goal}.
Use user's memory: ${JSON.stringify(input.context?.memory ?? {})}.
Return bullet points and note where sources would go.`
    )
    return { role: "research", content: draft }
  }
}