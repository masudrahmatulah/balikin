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
  // Re untuk better auth API routes
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "/api/[[...catchAll]]/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
