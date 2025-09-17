export async function llm(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return `[[MOCK-LLM: missing OPENAI_API_KEY]] ${prompt.slice(0, 200)}`;

  // If you're using a project key (sk-proj...), OpenAI recommends sending the project header.
  const openaiProject = process.env.OPENAI_PROJECT || process.env.OPENAI_PROJECT_ID || undefined;

  function extractText(j: any): string {
    // Chat Completions (string)
    const s = j?.choices?.[0]?.message?.content;
    if (typeof s === "string" && s.trim()) return s;

    // Chat Completions (array content)
    const arr = j?.choices?.[0]?.message?.content;
    if (Array.isArray(arr)) {
      const txt = arr.map((c: any) => (typeof c === "string" ? c : c?.text ?? "")).join("\n").trim();
      if (txt) return txt;
    }

    // Responses API conveniences
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

    // Some models return top-level content
    if (typeof j?.content === "string" && j.content.trim()) return j.content;

    return "";
  }

  // 1) Try Chat Completions first
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
        // GPT-5 requires max_completion_tokens (not max_tokens)
        max_completion_tokens: 800
      })
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return `[[LLM ERROR ${r.status}]] ${text.slice(0, 800)}`;
    }
    const j = await r.json().catch(() => ({} as any));
    const content = extractText(j);
    if (content) return content;

    // if empty, include a diagnostic slice so we can see the shape
    const raw = JSON.stringify(j);
    if (raw && raw.length) return `[[RAW CHAT JSON]] ${raw.slice(0, 1800)}`;
  } catch (e: any) {
    // fall through to responses
  }

  // 2) Fallback to Responses API (works well with GPT-5 families)
  try {
    const r2 = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
        ...(openaiProject ? { "OpenAI-Project": openaiProject } : {}),
        // some deployments gate features by this beta header
        "OpenAI-Beta": "responses-2024-10-22"
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        // Accept the simple form first
        input: prompt,
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

    const raw2 = JSON.stringify(j2);
    return `[[RAW RESP JSON]] ${raw2.slice(0, 1800)}`;
  } catch (e2: any) {
    return `[[LLM EXCEPTION]] ${String(e2).slice(0, 800)}`;
  }
}
