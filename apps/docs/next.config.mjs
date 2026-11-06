import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();
const docsRoot = dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === 'development';
const versions = JSON.parse(
  readFileSync(resolve(docsRoot, 'content/versions.json'), 'utf8'),
);

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  ...(isDev ? {} : { output: 'export' }),
  trailingSlash: true,
  images: { unoptimized: true },
  ...(isDev
    ? {
        async redirects() {
          return [
            {
              source: '/',
              destination: '/guides/quickstart',
              permanent: false,
            },
            {
              source: '/api',
              destination: '/api/dev',
              permanent: false,
            },
            {
              source: '/cli',
              destination: '/cli/dev',
              permanent: false,
            },
            {
              source: '/nextjs',
              destination: '/nextjs/dev',
              permanent: false,
            },
            {
              source: '/react',
              destination: '/react/dev',
              permanent: false,
            },
            {
              source: '/shadcn',
              destination: '/shadcn/dev',
              permanent: false,
            },
          ];
        },
      }
    : {}),
};

export default withMDX(config);
