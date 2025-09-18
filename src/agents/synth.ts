import { Agent, AgentInput, AgentResult } from "./types";
import { llm } from "./llm";

export const SynthAgent: Agent = {
  name: "synth",
  async run(input: AgentInput): Promise<AgentResult> {
    const memJson = JSON.stringify(input.context?.memory ?? {});
    const model = (input as any)?.context?.model as string | undefined;
    const latest = (input.context as any)?.latest ?? "";

    const prompt = [
      latest
        ? `Summarize the following material:\n${latest}\n`
        : `No material provided. Return a brief checklist for the given goal.\nGoal: ${input.goal}`,
      `Given user memory: ${memJson}.`,
      `Return:\n- 3–5 bullet summary (concise)\n- "Next 3 actions:" with numbered steps`
    ].join("\n");

    const msg = await llm(prompt, { model });
    return { role: "synth", content: msg ?? "" };
  }
};
