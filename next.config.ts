import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    // This is required to allow the Next.js dev server to accept requests from the Firebase Studio preview.
    allowedDevOrigins: ['**.cloudworkstations.dev'],
  }
};

export default nextConfig;
