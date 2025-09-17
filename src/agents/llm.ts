export async function llm(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return `[[MOCK-LLM: missing OPENAI_API_KEY]] ${prompt.slice(0, 200)}`
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-5-nano",          // ← Nano
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_completion_tokens: 500               // keep cost & latency tiny
      }),
    })
    if (!r.ok) {
      const text = await r.text().catch(() => "")
      return `[[LLM ERROR ${r.status}]] ${text.slice(0, 500)}`
    }
    const j = await r.json().catch(() => ({} as any))
    const content = j?.choices?.[0]?.message?.content
    return typeof content === "string" ? content : "(no content)"
  } catch (e: any) {
    return `[[LLM EXCEPTION]] ${String(e).slice(0, 500)}`
  }
}
