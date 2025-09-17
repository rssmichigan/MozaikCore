export async function llm(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return `[[MOCK-LLM: missing OPENAI_API_KEY]] ${prompt.slice(0, 200)}`;

  // helper to normalize various response shapes to text
  function extractText(j: any): string {
    // Chat Completions (string)
    const s = j?.choices?.[0]?.message?.content;
    if (typeof s === "string" && s.trim().length) return s;

    // Chat Completions (array content)
    const arr = j?.choices?.[0]?.message?.content;
    if (Array.isArray(arr)) {
      const txt = arr
        .map((c: any) => (typeof c === "string" ? c : c?.text ?? ""))
        .join("\n")
        .trim();
      if (txt) return txt;
    }

    // Responses API convenience
    const outTxt = j?.output_text;
    if (typeof outTxt === "string" && outTxt.trim()) return outTxt;

    // Responses API: output[0].content[*].text
    const blocks = j?.output?.[0]?.content;
    if (Array.isArray(blocks)) {
      const txt = blocks.map((b: any) => b?.text ?? "").join("\n").trim();
      if (txt) return txt;
    }

    return "";
  }

  // 1) Try Chat Completions
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        messages: [
          { role: "system", content: "You are a concise strategist. Produce clear, structured answers." },
          { role: "user", content: prompt }
        ],
        // GPT-5: use max_completion_tokens instead of max_tokens
        max_completion_tokens: 800
      }),
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return `[[LLM ERROR ${r.status}]] ${text.slice(0, 500)}`;
    }
    const j = await r.json().catch(() => ({} as any));
    const content = extractText(j);
    if (content) return content;
  } catch (e: any) {
    // fall through to Responses API
  }

  // 2) Fallback to Responses API
  try {
    const r2 = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        input: [
          { role: "system", content: "You are a concise strategist. Produce clear, structured answers." },
          { role: "user", content: prompt }
        ],
        // Responses API param
        max_output_tokens: 800
      }),
    });

    if (!r2.ok) {
      const text = await r2.text().catch(() => "");
      return `[[LLM ERROR ${r2.status}]] ${text.slice(0, 500)}`;
    }
    const j2 = await r2.json().catch(() => ({} as any));
    const content2 = extractText(j2);
    if (content2) return content2;
    return "(no content)";
  } catch (e2: any) {
    return `[[LLM EXCEPTION]] ${String(e2).slice(0, 500)}`;
  }
}
