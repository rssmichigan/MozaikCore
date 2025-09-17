export const runtime = "nodejs"

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "../../../auth"            // ← up to src/, then auth
import { prisma } from "../../../lib/db"              // ← up to src/, then lib/db
import { runAgents } from "../../../agents/orchestrator" // ← up to src/, then agents/...

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const { goal } = await req.json()

  if (!goal || typeof goal !== "string") {
    return NextResponse.json({ error: "Goal required" }, { status: 400 })
  }

  // Load user memory
  let memory: Record<string, string> = {}
  let userId: string | undefined = undefined    // ← correct TS (not `?:`)

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (user) {
      userId = user.id
      const mems = await prisma.memory.findMany({ where: { userId: user.id } })
      memory = Object.fromEntries(mems.map(m => [m.key, m.value]))
    }
  }

  // Run router → research/build → synth
  const out = await runAgents({ userId, goal, context: { memory } })

  // Persist
  await prisma.agentRun.create({
    data: { userId: userId ?? undefined, goal, output: JSON.stringify(out) }
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