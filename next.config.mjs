/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: ["*.cloudworkstations.dev"],
  },
  images: {
    remotePatterns: [
        { protocol: 'https', hostname: '**.tmdb.org' },
        { protocol: 'https', hostname: 'upload.wikimedia.org' },
        { protocol: 'https', hostname: 'logos-world.net' },
        { protocol: 'https', hostname: 'www.edigitalagency.com.au' },
        { protocol: 'https', hostname: 'placehold.co' },
        { protocol: 'https', hostname: 'www.filmibeat.com' },
        { protocol: 'https', hostname: 'assets-in.bmscdn.com' },
        { protocol: 'https, hostname: 'imgs.search.brave.com' },
    ],
  },
};

export default nextConfig;
