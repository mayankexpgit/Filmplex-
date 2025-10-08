/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This allows requests from the Firebase Studio development environment.
    allowedDevOrigins: ["*.cloudworkstations.dev"],
  },
};

export default nextConfig;
