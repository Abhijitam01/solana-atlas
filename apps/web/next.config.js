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
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false,
            os: false,
            util: require.resolve('util/'),
            events: require.resolve('events/'),
            process: require.resolve('process/browser'),
        };
        config.plugins.push(
            new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
                resource.request = resource.request.replace(/^node:/, "");
            }),
            new webpack.ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer'],
            })
        );
    }
    return config;
  },
};

module.exports = nextConfig;

