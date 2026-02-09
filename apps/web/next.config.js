/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@solana-playground/types", "@solana-playground/solana"],
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
    ],
  },
  // Ensure packages/solana templates are bundled for Vercel serverless
  experimental: {
    outputFileTracingRoot: require('path').join(__dirname, '../../'),
    outputFileTracingIncludes: {
      '/api/templates/[id]': ['../../packages/solana/templates/**/*'],
      '/api/templates/[id]/explain': ['../../packages/solana/templates/**/*'],
      '/api/templates': ['../../packages/solana/templates/**/*'],
    },
  },
};

module.exports = nextConfig;

