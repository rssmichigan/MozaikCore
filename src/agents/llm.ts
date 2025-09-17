// src/agents/llm.ts
export async function llm(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return `[[MOCK-LLM: missing OPENAI_API_KEY]] ${prompt.slice(0, 200)}`

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: "You are a concise strategist. When asked to research or build a plan, return clear bullet points or numbered steps only." },
        { role: "user", content: prompt }
      ],
      // GPT-5 uses max_completion_tokens
      max_completion_tokens: 800
    })
  })

  if (!r.ok) {
    const text = await r.text().catch(() => "")
    return `[[LLM ERROR ${r.status}]] ${text.slice(0, 500)}`
  }
  const j = await r.json().catch(() => ({} as any))
  const content = j?.choices?.[0]?.message?.content
  return typeof content === "string" ? content : ""
}