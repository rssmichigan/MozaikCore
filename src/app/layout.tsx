import type { ReactNode } from "react"
import SessionProviders from "../components/providers/Session"
import AuthButton from "../components/nav/AuthButton"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <SessionProviders>
          <header className="p-4 border-b"><AuthButton /></header>
          <main className="p-6">{children}</main>
        </SessionProviders>
      </body>
    </html>
  )
}