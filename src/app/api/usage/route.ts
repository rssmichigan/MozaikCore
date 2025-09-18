export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function GET() {
  const total = await prisma.agentRun.count();
  const since = new Date(Date.now() - 24*3600*1000);
  const last24h = await prisma.agentRun.count({ where: { createdAt: { gte: since } } });
  return NextResponse.json({ total, last24h });
}
