/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Keep CJS parsers out of the bundle so they run correctly on the server.
    serverComponentsExternalPackages: ["pdf-parse", "xlsx", "jszip"],
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

module.exports = nextConfig;
