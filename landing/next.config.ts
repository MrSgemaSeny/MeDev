import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  productionBrowserSourceMaps: false,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/auth/callback',
        destination: 'https://app.medev.mrsgemaseny.com/auth/callback',
        permanent: false,
      },
      {
        source: '/login',
        destination: 'https://app.medev.mrsgemaseny.com/login',
        permanent: false,
      },
      {
        source: '/register',
        destination: 'https://app.medev.mrsgemaseny.com/register',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: 'https://app.medev.mrsgemaseny.com/dashboard',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https: blob:; connect-src 'self' https://medev-backend.onrender.com https://va.vercel-scripts.com https://vitals.vercel-insights.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
