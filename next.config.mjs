/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.tmdb.org' },
      { protocol: 'https', hostname: '**.nflximg.net' },
      { protocol: 'https', hostname: 'www.filmibeat.com' },
      { protocol: 'https', hostname: '**.bmscdn.com' },
      { protocol: 'https', hostname: '**.google.com' },
      { protocol: 'https', hostname: '**.wikimedia.org' },
      { protocol: 'https', hostname: '**.brave.com' },
      { protocol: 'https', hostname: '**.media-amazon.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'logos-world.net' },
      { protocol: 'https', hostname: 'www.edigitalagency.com.au' },
    ],
  },
  experimental: {},
  devServer: {
    allowedDevOrigins: [
      'https://studio.web.google.com',
      'https://*.proxy.googleprod.com',
    ],
  },
};

export default nextConfig;
