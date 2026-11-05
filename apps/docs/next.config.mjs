import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();
const docsRoot = dirname(fileURLToPath(import.meta.url));
const staticExport = process.env.DOCS_STATIC_EXPORT === '1';

function packageVersion(path) {
  return JSON.parse(
    readFileSync(resolve(docsRoot, '../../', path, 'package.json'), 'utf8'),
  ).version;
}

const packageVersions = {
  nextjs: packageVersion('sdk/framework/nextjs'),
  react: packageVersion('sdk/framework/react'),
  shadcn: packageVersion('sdk/component/shadcn'),
  cli: packageVersion('packages/cli'),
};

const apiVersion = JSON.parse(
  readFileSync(
    resolve(docsRoot, '../../apps/api/docs/openapi.json'),
    'utf8',
  ),
).info.version;

const apiTagsPath = resolve(docsRoot, 'content/docs/api', apiVersion);
const apiTags = existsSync(apiTagsPath)
  ? readdirSync(apiTagsPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  : [];

const cliPath = resolve(
  docsRoot,
  'content/docs/cli',
  packageVersions.cli,
);
const cliCommands = existsSync(cliPath)
  ? readdirSync(cliPath, { withFileTypes: true })
      .filter((entry) => entry.name !== 'index.md')
      .map((entry) =>
        entry.isDirectory() ? entry.name : entry.name.replace(/\.md$/, ''),
      )
  : [];

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  ...(staticExport ? { output: 'export', trailingSlash: true } : {}),
  images: staticExport
    ? { unoptimized: true }
    : {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'img.shields.io',
          },
        ],
      },
  ...(staticExport
    ? {}
    : {
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
        source: '/reference/api',
        destination: `/api/${apiVersion}`,
        permanent: false,
      },
      ...apiTags.flatMap((tag) => [
        {
          source: `/api/${tag}`,
          destination: `/api/${apiVersion}/${tag}`,
          permanent: false,
        },
        {
          source: `/api/${tag}/:path*`,
          destination: `/api/${apiVersion}/${tag}/:path*`,
          permanent: false,
        },
        {
          source: `/reference/api/${tag}`,
          destination: `/api/${apiVersion}/${tag}`,
          permanent: false,
        },
        {
          source: `/reference/api/${tag}/:path*`,
          destination: `/api/${apiVersion}/${tag}/:path*`,
          permanent: false,
        },
      ]),
      {
        source: '/api',
        destination: `/api/${apiVersion}`,
        permanent: false,
      },
      {
        source: '/reference/api/v1',
        destination: `/api/${apiVersion}`,
        permanent: false,
      },
      {
        source: '/reference/api/v1/:path*',
        destination: `/api/${apiVersion}/:path*`,
        permanent: false,
      },
      {
        source: '/reference/cli',
        destination: `/cli/${packageVersions.cli}`,
        permanent: false,
      },
      {
        source: '/reference/cli/:path*',
        destination: `/cli/${packageVersions.cli}/:path*`,
        permanent: false,
      },
      {
        source: '/cli',
        destination: `/cli/${packageVersions.cli}`,
        permanent: false,
      },
      ...cliCommands.flatMap((command) => [
        {
          source: `/cli/${command}`,
          destination: `/cli/${packageVersions.cli}/${command}`,
          permanent: false,
        },
        {
          source: `/cli/${command}/:path*`,
          destination: `/cli/${packageVersions.cli}/${command}/:path*`,
          permanent: false,
        },
      ]),
      {
        source: '/reference/sdk',
        destination: '/shadcn',
        permanent: false,
      },
      {
        source: '/reference/sdk/nextjs',
        destination: `/nextjs/${packageVersions.nextjs}`,
        permanent: false,
      },
      {
        source: '/reference/sdk/nextjs/:path*',
        destination: `/nextjs/${packageVersions.nextjs}/:path*`,
        permanent: false,
      },
      {
        source: '/reference/sdk/react',
        destination: `/react/${packageVersions.react}`,
        permanent: false,
      },
      {
        source: '/reference/sdk/react/:path*',
        destination: `/react/${packageVersions.react}/:path*`,
        permanent: false,
      },
      {
        source: '/reference/sdk/shadcn',
        destination: `/shadcn/${packageVersions.shadcn}`,
        permanent: false,
      },
      {
        source: '/reference/sdk/shadcn/:path*',
        destination: `/shadcn/${packageVersions.shadcn}/:path*`,
        permanent: false,
      },
      {
        source: '/nextjs',
        destination: `/nextjs/${packageVersions.nextjs}`,
        permanent: false,
      },
      {
        source: '/react',
        destination: `/react/${packageVersions.react}`,
        permanent: false,
      },
      {
        source: '/shadcn',
        destination: `/shadcn/${packageVersions.shadcn}`,
        permanent: false,
      },
      {
        source: '/api/latest',
        destination: `/api/${apiVersion}`,
        permanent: false,
      },
      {
        source: '/api/latest/:path*',
        destination: `/api/${apiVersion}/:path*`,
        permanent: false,
      },
      {
        source: '/cli/latest',
        destination: `/cli/${packageVersions.cli}`,
        permanent: false,
      },
      {
        source: '/cli/latest/:path*',
        destination: `/cli/${packageVersions.cli}/:path*`,
        permanent: false,
      },
      {
        source: '/nextjs/latest',
        destination: `/nextjs/${packageVersions.nextjs}`,
        permanent: false,
      },
      {
        source: '/nextjs/latest/:path*',
        destination: `/nextjs/${packageVersions.nextjs}/:path*`,
        permanent: false,
      },
      {
        source: '/react/latest',
        destination: `/react/${packageVersions.react}`,
        permanent: false,
      },
      {
        source: '/react/latest/:path*',
        destination: `/react/${packageVersions.react}/:path*`,
        permanent: false,
      },
      {
        source: '/shadcn/latest',
        destination: `/shadcn/${packageVersions.shadcn}`,
        permanent: false,
      },
      {
        source: '/shadcn/latest/:path*',
        destination: `/shadcn/${packageVersions.shadcn}/:path*`,
        permanent: false,
      },
      {
        source: '/components',
        destination: `/shadcn/${packageVersions.shadcn}`,
        permanent: false,
      },
      {
        source: '/components/:path*',
        destination: `/shadcn/${packageVersions.shadcn}/:path*`,
        permanent: false,
      },
          ];
        },
      }),
};

export default withMDX(config);
