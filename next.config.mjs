/** @type {import('next').NextConfig} */
const nextConfig = {
  // knowledge.md lives in the repo root and is read at build/runtime.
  // Make sure Next bundles it into the serverless functions that need it.
  outputFileTracingIncludes: {
    '/wissen': ['./knowledge.md'],
    '/': ['./knowledge.md'],
    '/api/refresh': ['./knowledge.md'],
  },
}

export default nextConfig
