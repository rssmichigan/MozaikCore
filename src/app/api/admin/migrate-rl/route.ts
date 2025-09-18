export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function POST() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "RateEvent" (
        "id" text PRIMARY KEY,
        "key" text NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "RateEvent_key_createdAt_idx"
      ON "RateEvent"("key","createdAt");
    `);
    return NextResponse.json({ ok: true });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: String(e) }, { status: 500 });
  }
}
