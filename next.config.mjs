
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@genkit-ai/firebase"],
  },
  devServer: {
    allowedDevOrigins: [
      "https://vexel-cinema-develop.web.app",
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
