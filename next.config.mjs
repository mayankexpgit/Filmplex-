/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
       {
        protocol: 'https',
        hostname: '**.tmdb.org',
      },
      {
        protocol: 'https',
        hostname: 'dnm.nflximg.net',
      },
       {
        protocol: 'https',
        hostname: '**.nflximg.net',
      },
       {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
       {
        protocol: 'https',
        hostname: '**.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'logos-world.net',
      },
      {
        protocol: 'https',
        hostname: 'www.edigitalagency.com.au',
      },
       {
        protocol: 'https',
        hostname: '**.filmibeat.com',
      },
    ],
  },
  experimental: {
  },
};

export default nextConfig;
