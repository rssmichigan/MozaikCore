export const runtime = "nodejs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"             // ✅ use alias to avoid path issues
import bcrypt from "bcryptjs"
import { z } from "zod"

const Schema = z.object({
  name: z.string().trim().min(1, "Name required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
})

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    const issues = parsed.error.flatten().fieldErrors
    return NextResponse.json({ error: "Invalid", issues }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: "Email in use" }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({ data: { name, email, passwordHash } })
  return NextResponse.json({ id: user.id }, { status: 201 })
}