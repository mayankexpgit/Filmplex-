/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: ["*.cloudworkstations.dev"],
  },
  images: {
    remotePatterns: [
      // More specific wildcards for better reliability on Vercel
      { protocol: 'https', hostname: '*.tmdb.org' },
      { protocol: 'https', hostname: '*.google.com' },
      { protocol: 'https', hostname: '*.wikimedia.org' },
      { protocol: 'https', hostname: '*.bmscdn.com' },
      { protocol: 'https', hostname: '*.brave.com' },
      { protocol: 'https', hostname: 'www.filmibeat.com' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
};

export default nextConfig;
