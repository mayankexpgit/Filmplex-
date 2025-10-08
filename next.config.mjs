/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        allowedDevOrigins: ["6000-firebase-studio-1754397069489.cluster-fdkw7vjj7bgguspe3fbbc25tra.cloudworkstations.dev"]
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'image.tmdb.org',
            },
            {
                protocol: 'https',
                hostname: 'www.filmibeat.com',
            },
            {
                protocol: 'https',
                hostname: 'upload.wikimedia.org',
            },
            {
                protocol: 'https',
                hostname: 'logos-world.net',
            },
            {
                protocol: 'https',
                hostname: 'www.edigitalagency.com.au',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: 'assets-in.bmscdn.com',
            }
        ],
    },
};

export default nextConfig;
