export const runtime = "nodejs"
import NextAuth from "next-auth"
import { authOptions } from "../../../../auth"   // relative path to src/auth.ts

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }