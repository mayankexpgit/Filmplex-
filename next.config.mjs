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
  experimental: {
    // This is the correct place for allowedDevOrigins in newer Next.js versions.
    // We will keep it here to avoid future cross-origin issues during development.
    allowedDevOrigins: [
      '9000-firebase-studio-1754397069489.cluster-fdkw7vjj7bgguspe3fbbc25tra.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
