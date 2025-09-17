export async function llm(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return `[[MOCK-LLM: missing OPENAI_API_KEY]] ${prompt.slice(0, 200)}`;

  const openaiProject = process.env.OPENAI_PROJECT || process.env.OPENAI_PROJECT_ID || undefined;

  function extractText(j: any): string {
    const s = j?.choices?.[0]?.message?.content;
    if (typeof s === "string" && s.trim()) return s;
    const arr = j?.choices?.[0]?.message?.content;
    if (Array.isArray(arr)) {
      const txt = arr.map((c: any) => (typeof c === "string" ? c : c?.text ?? "")).join("\n").trim();
      if (txt) return txt;
    }
    const outTxt = j?.output_text;
    if (typeof outTxt === "string" && outTxt.trim()) return outTxt;
    const blocks = j?.output?.[0]?.content;
    if (Array.isArray(blocks)) {
      const txt = blocks.map((b: any) => {
        if (typeof b === "string") return b;
        if (b?.text) return b.text;
        if (b?.type === "output_text" && b?.value) return b.value;
        return "";
      }).join("\n").trim();
      if (txt) return txt;
    }
    if (typeof j?.content === "string" && j.content.trim()) return j.content;
    return "";
  }

  // 1) Chat Completions (force text)
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
        ...(openaiProject ? { "OpenAI-Project": openaiProject } : {})
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        messages: [
          { role: "system", content: "You are a concise strategist. Produce clear, structured, helpful answers." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "text" },      // ← ask for text explicitly
        max_completion_tokens: 800
      })
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      // only diag here; we’ll try Responses API next
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`CHAT ${r.status}: ${text.slice(0, 600)}`);
    }
    const j = await r.json().catch(() => ({} as any));
    const content = extractText(j);
    if (content) return content;
    // fall through to Responses API if empty
  } catch {
    // proceed to responses
  }

  // 2) Responses API (great with GPT-5)
  try {
    const r2 = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
        ...(openaiProject ? { "OpenAI-Project": openaiProject } : {}),
        "OpenAI-Beta": "responses-2024-10-22"
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        input: [
          { role: "system", content: "You are a concise strategist. Produce clear, structured, helpful answers." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "text" },     // ← force text mode here too
        max_output_tokens: 800
      })
    });

    if (!r2.ok) {
      const text2 = await r2.text().catch(() => "");
      return `[[LLM ERROR ${r2.status}]] ${text2.slice(0, 800)}`;
    }
    const j2 = await r2.json().catch(() => ({} as any));
    const content2 = extractText(j2);
    if (content2) return content2;

    return `[[RAW RESP JSON]] ${JSON.stringify(j2).slice(0, 1800)}`;
  } catch (e2: any) {
    return `[[LLM EXCEPTION]] ${String(e2).slice(0, 800)}`;
  }
}
