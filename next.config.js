/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // ✅ disables Next.js image optimization, allowing all image sources without config.
  },
};

module.exports = nextConfig;
