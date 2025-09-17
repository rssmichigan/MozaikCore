export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    vercelEnv: process.env.VERCEL_ENV ?? null,
    present: {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      DATABASE_URL:   !!process.env.DATABASE_URL,
      DIRECT_URL:     !!process.env.DIRECT_URL,
      AUTH_SECRET:    !!process.env.AUTH_SECRET
    }
  });
}
