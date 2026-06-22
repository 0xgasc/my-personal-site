/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scontent-iad4-1.choicecdn.com',
      },
      {
        protocol: 'https',
        hostname: 'i2.seadn.io',
      },
      {
        protocol: 'https',
        hostname: 'raw2.seadn.io',
      },
      {
        protocol: 'https',
        hostname: 'arweave.net',
      },
      {
        protocol: 'https',
        hostname: 'art-blocks-explorations-mainnet.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.objkt.media', // ✅ this is good
      },
      {
        protocol: 'https',
        hostname: 'f8n-production-collection-assets.imgix.net',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
};

module.exports = nextConfig;
