const HOST = 'https://mozaikai.com'
const paths = ['/', '/ingest', '/semantic', '/tools', '/profile', '/critic']

export function GET() {
  const now = new Date().toISOString()
  const urls = paths
    .map(
      (p) => `<url><loc>${HOST}${p}</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>`
    )
    .join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
}
