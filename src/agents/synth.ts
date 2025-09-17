import { Agent, AgentInput, AgentResult } from "./types";
import { llm } from "./llm";

export const SynthAgent: Agent = {
  name: "synth",
  async run(input: AgentInput): Promise<AgentResult> {
    const mem = JSON.stringify(input.context?.memory ?? {});
    const prompt = [
      `Synthesize final output for the user.`,
      `Given memory: ${mem}.`,
      `Return:`,
      `- 3-5 bullet summary (concise)`,
      `- "Next 3 actions:" as numbered steps`
    ].join("\n");

    const msg = await llm(prompt);
    return { role: "synth", content: msg ?? "" };
  }
};
