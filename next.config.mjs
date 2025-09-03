
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Vercel-friendly comprehensive list
      { protocol: 'https', hostname: '**.tmdb.org' },
      { protocol: 'https', hostname: '**.themoviedb.org' },
      { protocol: 'https', hostname: '**.nflximg.net' },
      { protocol: 'https', hostname: '**.media-amazon.com' },
      { protocol: 'https', hostname: 'imgs.search.brave.com' },
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'logos-world.net' },
      { protocol: 'https', hostname: 'www.edigitalagency.com.au' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4.5mb',
    }
  },
  devServer: {
    allowedDevOrigins: [
      'https://stackblitz.com',
      'https://*.stackblitz.io'
    ]
  }
};

export default nextConfig;

