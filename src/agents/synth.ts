import { Agent, AgentInput, AgentResult } from "./types"
import { llm } from "./llm"

export const SynthAgent: Agent = {
  name: "synth",
  async run(input: AgentInput): Promise<AgentResult> {
    const msg = await llm(
      `Synthesize final output for user with memory ${JSON.stringify(input.context?.memory ?? {})}.
Return concise summary + next 3 actions.`
    )
    return { role: "synth", content: msg }
  }
}