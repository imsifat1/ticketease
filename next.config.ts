import type {NextConfig} from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Enable static exports
  output: 'export',
  // Configure base path for GitHub Pages
  basePath: isProd ? '/ticketease' : '',
  // Configure asset prefix for GitHub Pages
  assetPrefix: isProd ? '/ticketease/' : '',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bdtickets.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
