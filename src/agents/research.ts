import { Agent, AgentInput, AgentResult } from "./types";
import { llm } from "./llm";

export const ResearchAgent: Agent = {
  name: "research",
  async run(input: AgentInput): Promise<AgentResult> {
    const mem = JSON.stringify(input.context?.memory ?? {});
    const prompt = [
      `Research the following: ${input.goal}.`,
      `Use user's memory if helpful: ${mem}.`,
      `Return 5-10 bullet points; each bullet = key finding + 1-line rationale.`,
      `Keep it concise and actionable.`
    ].join("\n");

    const draft = await llm(prompt);
    return { role: "research", content: draft ?? "" };
  }
};