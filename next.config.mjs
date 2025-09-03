/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@genkit-ai/firebase'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.tmdb.org',
      },
      {
        protocol: 'https',
        hostname: '**.nflximg.net',
      },
       {
        protocol: 'https',
        hostname: '*.google.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'www.filmibeat.com',
      },
      {
        protocol: 'https',
        hostname: '*.bmscdn.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'pics.filmaffinity.com',
      },
      {
        protocol: 'https',
        hostname: 'imgs.search.brave.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org'
      },
      {
        protocol: 'https',
        hostname: 'logos-world.net'
      },
      {
        protocol: 'https',
        hostname: 'www.edigitalagency.com.au'
      }
    ],
  },
  devServer: {
    allowedDevOrigins: [
      'https://firebase.studio',
      'https://*.firebase.studio',
      'https://*.web.app',
      'https://*.firebaseapp.com',
    ],
  },
};

export default nextConfig;
