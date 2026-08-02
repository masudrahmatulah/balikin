/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [],
  outputFileTracingIncludes: {
    '/admin/api/vdp/generate': ['./assets/fonts/*.ttf'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 85, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.vercel.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'supabase.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'midtrans.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.bi.go.id',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
      allowedOrigins: ['localhost:3000', 'devtunnels.ms', '*.devtunnels.ms'],
    },
  },
};

module.exports = nextConfig;
