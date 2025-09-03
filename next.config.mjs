/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {},
  devServer: {
    allowedDevOrigins: ['https://studio.web.app'],
  },
};

export default nextConfig;
