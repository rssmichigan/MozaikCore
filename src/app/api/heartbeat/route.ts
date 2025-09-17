export const runtime = "nodejs"
import { NextResponse } from "next/server"
import { prisma } from "../../../lib/db"

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, db: "up", ts: new Date().toISOString() })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "db error" }, { status: 500 })
  }
}
