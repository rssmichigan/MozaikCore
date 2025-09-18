export const runtime = "nodejs"
export const runtime = "nodejs"


import type { NextRequest } from "next/server"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getServerSession } from "next-auth"


import { authOptions } from "../../../auth"            // ← up to src/, then auth
import { authOptions } from "../../../auth"            // ← up to src/, then auth
import { prisma } from "../../../lib/db"              // ← up to src/, then lib/db
import { prisma } from "../../../lib/db"              // ← up to src/, then lib/db
import { runAgents } from "../../../agents/orchestrator" // ← up to src/, then agents/...
import { runAgents } from "../../../agents/orchestrator" // ← up to src/, then agents/...


export async function POST(req: NextRequest) {
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const session = await getServerSession(authOptions)
  const body = await req.json()
  const body = await req.json()
  const goal = (body?.goal as string) || ""
  const goal = (body?.goal as string) || ""
  const model = (body?.model as string) || undefined
  const model = (body?.model as string) || undefined


  if (!goal || typeof goal !== "string") {
  if (!goal || typeof goal !== "string") {
    return NextResponse.json({ error: "Goal required" }, { status: 400 })
    return NextResponse.json({ error: "Goal required" }, { status: 400 })
  }
  }


  // Load user memory
  // Load user memory
  let memory: Record<string, string> = {}
  let memory: Record<string, string> = {}
  let userId: string | undefined = undefined    // ← correct TS (not `?:`)
  let userId: string | undefined = undefined    // ← correct TS (not `?:`)


  if (session?.user?.email) {
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  const RL_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000)
  const RL_MAX = Number(process.env.RATE_LIMIT_MAX ?? 20)
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim()
  const key = session?.user?.email ?? ip
  const since = new Date(Date.now() - RL_WINDOW_MS)
  const recent = await prisma.rateEvent.count({ where: { key, createdAt: { gte: since } } })
  if (recent >= RL_MAX) { return NextResponse.json({ error: "Too many requests" }, { status: 429 }) }
  await prisma.rateEvent.create({ data: { key } })
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (user) {
    if (user) {
      userId = user.id
      userId = user.id
      const mems = await prisma.memory.findMany({ where: { userId: user.id } })
      const mems = await prisma.memory.findMany({ where: { userId: user.id } })
      memory = Object.fromEntries(mems.map(m => [m.key, m.value]))
      memory = Object.fromEntries(mems.map(m => [m.key, m.value]))
    }
    }
  }
  }


  // Run router → research/build → synth
  // Run router → research/build → synth
  const out = await runAgents({ userId, goal, context: { memory, model } })
  const out = await runAgents({ userId, goal, context: { memory, model } })


  // Persist
  // Persist
  await prisma.agentRun.create({
  await prisma.agentRun.create({
    data: { userId: userId ?? undefined, goal, output: JSON.stringify(out) }
    data: { userId: userId ?? undefined, goal, output: JSON.stringify(out) }
  })
  })


  return NextResponse.json(out)
  return NextResponse.json(out)
}
}


export async function GET() {
export async function GET() {
  const runs = await prisma.agentRun.findMany({
  const runs = await prisma.agentRun.findMany({
    orderBy: { createdAt: "desc" },
    orderBy: { createdAt: "desc" },
    take: 10
    take: 10
  })
  })
  return NextResponse.json(runs)
  return NextResponse.json(runs)
}
}
