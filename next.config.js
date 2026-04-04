/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds for faster build time
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript type checking during builds for faster build time
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

module.exports = nextConfig;
