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
        destination: '/docs/guides/quickstart',
        permanent: false,
      },
      {
        source: '/docs',
        destination: '/docs/guides/quickstart',
        permanent: false,
      },
      {
        source: '/docs/guides',
        destination: '/docs/guides/quickstart',
        permanent: false,
      },
      {
        source: '/docs/reference',
        destination: '/docs/reference/overview',
        permanent: false,
      },
      {
        source: '/docs/concepts',
        destination: '/docs/concepts/tenants',
        permanent: false,
      },
      {
        source: '/docs/self-hosting',
        destination: '/docs/self-hosting/index',
        permanent: false,
      },
    ];
  },
};

export default withMDX(config);
