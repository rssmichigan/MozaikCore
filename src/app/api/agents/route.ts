export const runtime = "nodejs"

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "../../../auth"
import { prisma } from "../../../lib/db"
import { runAgents } from "../../../agents/orchestrator"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const body = await req.json()

  const goal  = (body?.goal  as string) || ""
  const model = (body?.model as string) || undefined
  const mode  = (body?.mode  as string) || undefined

  if (!goal || typeof goal !== "string") {
    return NextResponse.json({ error: "Goal required" }, { status: 400 })
  }

  // Load user memory
  let memory: Record<string, string> = {}
  let userId: string | undefined = undefined

  // Atomic RL bucket (per key, per window)
  const RL_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000)
  const RL_MAX       = Number(process.env.RATE_LIMIT_MAX ?? 20)
  const ip  = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim()
  const key = session?.user?.email ?? ip
  const windowStart = new Date(Math.floor(Date.now() / RL_WINDOW_MS) * RL_WINDOW_MS)

  // upsert+increment, then read back
  await prisma.rateBucket.upsert({
    where: { key_windowStart: { key, windowStart } },
    update: { count: { increment: 1 } },
    create: { key, windowStart, count: 1 }
  })
  const bucket = await prisma.rateBucket.findUnique({
    where: { key_windowStart: { key, windowStart } }
  })
  if (bucket && bucket.count > RL_MAX) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  // memory for signed-in users
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (user) {
      userId = user.id
      const mems = await prisma.memory.findMany({ where: { userId: user.id } })
      memory = Object.fromEntries(mems.map(m => [m.key, m.value]))
    }
  }

  // run agents (mode is optional)
  const out = await runAgents({ userId, goal, context: { memory, model, mode } })

  // persist
  await prisma.agentRun.create({
    data: { userId: userId ?? undefined, goal, output: JSON.stringify(out) }
  })

  return NextResponse.json(out)
}

// GET: recent runs for the signed-in user; [] for anonymous
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json([])

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json([])

  const runs = await prisma.agentRun.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10
  })
  return NextResponse.json(runs)
}
