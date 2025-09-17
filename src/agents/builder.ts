import { Agent, AgentInput, AgentResult } from "./types";
import { llm } from "./llm";

export const BuilderAgent: Agent = {
  name: "builder",
  async run(input: AgentInput): Promise<AgentResult> {
    const prompt = [
      `Create an implementation plan for: ${input.goal}.`,
      `Return the following sections:`,
      `1) Files to create`,
      `2) APIs/endpoints`,
      `3) Data models`,
      `4) Acceptance tests`,
      `Use clear bullet points or numbered steps.`
    ].join("\n");

    const spec = await llm(prompt);
    return { role: "builder", content: spec ?? "" };
  }
};