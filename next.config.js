/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Disable TypeScript type checking during builds for faster build time
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [],

  // Add headers for all routes
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
