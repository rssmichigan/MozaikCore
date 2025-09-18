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
  const goal = (body?.goal as string) || ""
  const model = (body?.model as string) || undefined

  if (!goal || typeof goal !== "string") {
    return NextResponse.json({ error: "Goal required" }, { status: 400 })
  }

  let memory: Record<string, string> = {}
  let userId: string | undefined = undefined

  const RL_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000)
  const RL_MAX = Number(process.env.RATE_LIMIT_MAX ?? 20)
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim()
  const key = session?.user?.email ?? ip
  const since = new Date(Date.now() - RL_WINDOW_MS)
  const recent = await prisma.rateEvent.count({ where: { key, createdAt: { gte: since } } })
  if (recent >= RL_MAX) return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  await prisma.rateEvent.create({ data: { key } })

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (user) {
      userId = user.id
      const mems = await prisma.memory.findMany({ where: { userId: user.id } })
      memory = Object.fromEntries(mems.map(m => [m.key, m.value]))
    }
  }

  const out = await runAgents({ userId, goal, context: { memory, model } })

  await prisma.agentRun.create({
    data: { userId: userId ?? undefined, goal, output: JSON.stringify(out), model }
  })

  return NextResponse.json(out)
}

export async function GET() {
  const runs = await prisma.agentRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 10
  })
  return NextResponse.json(runs)
}
