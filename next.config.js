/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,   // ✅ disables Next.js image optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow any hostname
      },
    ],
  },
};

module.exports = nextConfig;
