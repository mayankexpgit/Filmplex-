/** @type {import('next').NextConfig} */
const nextConfig = {
  // `allowedDevOrigins` is used to allow requests from the development environment (Firebase Studio)
  // to the Next.js development server. This is necessary to avoid cross-origin errors.
  // This is a development-only setting and will not affect your production build.
  allowedDevOrigins: [
    "https://*.cluster-fdkw7vjj7bgguspe3fbbc25tra.cloudworkstations.dev",
  ],
};

export default nextConfig;
