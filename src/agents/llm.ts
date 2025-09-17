export async function llm(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return `[[MOCK-LLM: missing OPENAI_API_KEY]] ${prompt.slice(0,200)}`;

  const openaiProject =
    process.env.OPENAI_PROJECT ||
    process.env.OPENAI_PROJECT_ID ||
    undefined;

  function extractText(j: any): string {
    if (typeof j?.output_text === "string" && j.output_text.trim()) return j.output_text;
    const blocks = j?.output;
    if (Array.isArray(blocks)) {
      const txt = blocks.map((b: any) => {
        const c = b?.content;
        if (typeof c === "string") return c;
        if (Array.isArray(c)) return c.map((x: any) => x?.text ?? "").join("\n");
        return b?.text ?? "";
      }).join("\n").trim();
      if (txt) return txt;
    }
    if (typeof j?.content === "string" && j.content.trim()) return j.content;
    return "";
  }

  try {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
        ...(openaiProject ? { "OpenAI-Project": openaiProject } : {}),
        "OpenAI-Beta": "responses-2024-10-22"
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        input: `SYSTEM: You are a concise strategist. Return clear, structured plain text answers.\nUSER: ${prompt}`,
        text: { format: { type: "plain" } },   // ← correct shape
        max_output_tokens: 400
      })
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return `[[LLM ERROR ${r.status}]] ${text.slice(0,800)}`;
    }

    const j = await r.json().catch(() => ({} as any));
    const txt = extractText(j);
    return txt || `[[RAW RESP JSON]] ${JSON.stringify(j).slice(0,1800)}`;
  } catch (e: any) {
    return `[[LLM EXCEPTION]] ${String(e).slice(0,800)}`;
  }
}
