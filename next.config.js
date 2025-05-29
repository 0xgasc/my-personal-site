/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'scontent-iad4-1.choicecdn.com',
      'i2.seadn.io',
      'raw2.seadn.io',
      'arweave.net',
      'art-blocks-explorations-mainnet.s3.amazonaws.com',
      'assets.objkt.media',
      'f8n-production-collection-assets.imgix.net',
      'via.placeholder.com', // <--- Add this line
    ],
  },
};

module.exports = nextConfig;
