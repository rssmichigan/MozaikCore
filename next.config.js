/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // IMPORTANT: do NOT set `output: 'export'` — it disables API routes and server functions.
  // If you want a bundle optimized for serverless, you can use 'standalone' instead:
  // output: 'standalone',
};
module.exports = nextConfig;
