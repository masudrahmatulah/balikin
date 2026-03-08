import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds for now
    // TODO: Fix unused imports and enable again
    ignoreDuringBuilds: true,
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

export default nextConfig;
