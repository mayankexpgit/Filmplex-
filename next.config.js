/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    TMDB_API_KEY_1: process.env.TMDB_API_KEY_1,
    TMDB_API_KEY_2: process.env.TMDB_API_KEY_2,
  },
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
