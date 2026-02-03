import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.shields.io',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/guides/quickstart',
        permanent: false,
      },
      {
        source: '/guides',
        destination: '/guides/quickstart',
        permanent: false,
      },
      {
        source: '/reference',
        destination: '/reference/overview',
        permanent: false,
      },
      {
        source: '/concepts',
        destination: '/docs/concepts/tenants',
        permanent: false,
      },
    ];
  },
};

export default withMDX(config);
