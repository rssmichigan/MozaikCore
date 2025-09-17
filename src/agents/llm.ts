export async function llm(prompt: string): Promise<string> {
  // Swap with real provider later
  return `[[MOCK-LLM]] ${prompt.slice(0, 300)}`
}