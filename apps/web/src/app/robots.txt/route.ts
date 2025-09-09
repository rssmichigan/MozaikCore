export function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Sitemap: https://mozaikai.com/sitemap.xml',
  ].join('\n')
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } })
}
