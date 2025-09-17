export const runtime = "nodejs"

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "../../../auth"
import { prisma } from "../../../lib/db"
import { runAgents } from "../../../agents/orchestrator"

// simple in-memory rate limit for previews
const RL_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000)
const RL_MAX = Number(process.env.RATE_LIMIT_MAX ?? 10)
const rlStore: Map<string, number[]> = (global as any).rlStore ?? new Map()
if (!(global as any).rlStore) (global as any).rlStore = rlStore
function rateLimit(key: string): boolean {
  const now = Date.now()
  const arr = rlStore.get(key) ?? []
  const filtered = arr.filter(t => now - t < RL_WINDOW_MS)
  if (filtered.length >= RL_MAX) return false
  filtered.push(now)
  rlStore.set(key, filtered)
  return true
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const { goal } = await req.json()

  if (typeof goal !== "string" || !goal.trim())
    return NextResponse.json({ error: "Goal required" }, { status: 400 })
  if (goal.length > 2000)
    return NextResponse.json({ error: "Goal too long (max 2000 chars)" }, { status: 400 })

  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim()
  if (!rateLimit(ip))
    return NextResponse.json({ error: "Too many requests, slow down" }, { status: 429 })

  // load memory (optional)
  let memory: Record<string, string> = {}
  let userId: string | undefined = undefined
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (user) {
      userId = user.id
      const mems = await prisma.memory.findMany({ where: { userId: user.id } })
      memory = Object.fromEntries(mems.map(m => [m.key, m.value]))
    }
  }

  const out = await runAgents({ userId, goal, context: { memory } })
  await prisma.agentRun.create({ data: { userId: userId ?? undefined, goal, output: JSON.stringify(out) } })

  // save last synth for personalization
  const synth = Array.isArray(out) ? out.find((x:any)=>x?.role==="synth") : null
  if (userId && synth?.content) {
    await prisma.memory.upsert({
      where: { userId_key: { userId, key: "agent:last_synth" } },
      update: { value: synth.content },
      create: { userId, key: "agent:last_synth", value: synth.content }
    })
  }

  return NextResponse.json(out)
}

export async function GET() {
  const runs = await prisma.agentRun.findMany({ orderBy: { createdAt: "desc" }, take: 10 })
  return NextResponse.json(runs)   // [] if none yet
}
