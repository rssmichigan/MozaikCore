/** @type {import('next').NextConfig} */
module.exports = {
  outputFileTracingRoot: __dirname,
  // Optional: skip lint in prod builds while we're wiring things
  eslint: { ignoreDuringBuilds: true },
};