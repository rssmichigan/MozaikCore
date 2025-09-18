import { AgentInput, AgentResult } from "./types";
import { RouterAgent } from "./router";
import { ResearchAgent } from "./research";
import { BuilderAgent } from "./builder";
import { SynthAgent } from "./synth";

export async function runAgents(input: AgentInput): Promise<AgentResult[]> {
  const results: AgentResult[] = [];

  const route = (await RouterAgent.run(input)).data?.route;
  let latest: AgentResult | null = null;

  if (route === "research") {
    const r = await ResearchAgent.run(input);
    results.push(r);
    latest = r;
  } else if (route === "build") {
    const b = await BuilderAgent.run(input);
    results.push(b);
    latest = b;
  } else {
    // direct reply route (stub)
    latest = { role: "reply", content: "Direct reply route (stub)" };
    results.push(latest);
  }

  // Hand the latest content to synth as material to summarize
  const synthPromptInput: AgentInput = {
    ...input,
    context: {
      ...(input.context ?? {}),
      latest: latest?.content ?? ""
    }
  };
  const s = await SynthAgent.run(synthPromptInput);
  results.push(s);

  return results;
}
