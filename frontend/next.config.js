/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      poll: 2000,
      aggregateTimeout: 500,
    };
    return config;
  },
}

module.exports = nextConfig
