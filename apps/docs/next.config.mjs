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

const versionedSections = ['api', 'cli', 'nextjs', 'react', 'shadcn'];
const sectionVersion = (section) => versions[section] ?? 'dev';
const unversionedPath =
  '(?!dev(?:/|$)|latest(?:/|$)|\\d+\\.\\d+\\.\\d+(?:/|$)).+';

const legacyPrefixes = [
  ['/reference/api/v1', 'api'],
  ['/reference/api', 'api'],
  ['/reference/cli', 'cli'],
  ['/reference/sdk/nextjs', 'nextjs'],
  ['/reference/sdk/react', 'react'],
  ['/reference/sdk/shadcn', 'shadcn'],
  ['/components', 'shadcn'],
];

function redirects() {
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
      source: '/concepts',
      destination: '/concepts/tenants',
      permanent: false,
    },
    {
      source: '/reference',
      destination: '/overview',
      permanent: false,
    },
    {
      source: '/reference/overview',
      destination: '/overview',
      permanent: false,
    },
    {
      source: '/reference/sdk',
      destination: '/shadcn',
      permanent: false,
    },
    ...legacyPrefixes.map(([from, section]) => ({
      source: `${from}/:path*`,
      destination: `/${section}/${sectionVersion(section)}/:path*`,
      permanent: false,
    })),
    ...versionedSections.flatMap((section) => [
      {
        source: `/${section}/latest/:path*`,
        destination: `/${section}/${sectionVersion(section)}/:path*`,
        permanent: false,
      },
      {
        source: `/${section}/:path(${unversionedPath})`,
        destination: `/${section}/${sectionVersion(section)}/:path`,
        permanent: false,
      },
    ]),
  ];
}

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  ...(isDev ? {} : { output: 'export' }),
  trailingSlash: true,
  images: { unoptimized: true },
  ...(isDev
    ? {
        async redirects() {
          return redirects();
        },
      }
    : {}),
};

export default withMDX(config);
