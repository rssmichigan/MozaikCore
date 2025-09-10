const COOKIE_NAME = 'mz_sess'

// Build a proper JSON Response and clear the cookie in headers
function logoutResponse(): Response {
  const body = JSON.stringify({ ok: true })
  const headers = new Headers({
    'Content-Type': 'application/json',
    // Clear cookie immediately
    'Set-Cookie': `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Secure`,
  })
  return new Response(body, { status: 200, headers })
}

export async function POST() {
  return logoutResponse()
}

export async function GET() {
  return logoutResponse()
}
