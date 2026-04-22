/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    workerThreads: false,
  },
  swcMinify: false,
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
