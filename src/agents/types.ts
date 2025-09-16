export type AgentInput = { userId?: string; goal: string; context?: Record<string, any> }
export type AgentResult = { role: string; content: string; data?: any; traces?: any[] }
export interface Agent { name: string; run(input: AgentInput): Promise<AgentResult> }