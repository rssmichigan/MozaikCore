export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000);
  const max = Number(process.env.RATE_LIMIT_MAX ?? 20);

  const xfwd = (Object.fromEntries((req as any).headers)[ "x-forwarded-for" ] as string | undefined) ?? "anon";
  const ip = xfwd.split(",")[0].trim();
  const key = ip; // not using session here, just IP

  const since = new Date(Date.now() - windowMs);
  const before = await prisma.rateEvent.count({ where: { key, createdAt: { gte: since } } });

  await prisma.rateEvent.create({ data: { key } });
  const after = await prisma.rateEvent.count({ where: { key, createdAt: { gte: since } } });

  return NextResponse.json({
    env: { windowMs, max },
    key,
    recentBefore: before,
    recentAfter: after
  });
}
