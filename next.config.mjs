/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'media.themoviedb.org' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'logos-world.net' },
      { protocol: 'https', hostname: 'www.edigitalagency.com.au' },
      { protocol: 'https', hostname: 'www.filmibeat.com' },
      { protocol: 'https', hostname: 'assets-in.bmscdn.com' },
      { protocol: 'https', hostname: 'imgs.search.brave.com' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@genkit-ai/googleai'],
  },
  devServer: {
    allowedDevOrigins: ['https://studio.web.google.com'],
  },
};

export default nextConfig;
