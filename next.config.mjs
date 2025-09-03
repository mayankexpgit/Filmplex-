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
  devServer: {
    allowedDevOrigins: ['https://*.cloudworkstations.dev'],
  },
};

export default nextConfig;
