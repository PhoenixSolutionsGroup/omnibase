import aliasManifest from '../content/version-aliases.json';
import versions from '../content/versions.json';

type Section = keyof typeof versions;

const aliases: Partial<Record<string, Record<string, string>>> = aliasManifest;

const exact: Record<string, string> = {
  '/': '/guides/quickstart',
  '/guides': '/guides/quickstart',
  '/concepts': '/concepts/tenants',
  '/reference': '/overview',
  '/reference/overview': '/overview',
  '/reference/sdk': '/shadcn',
};

const prefixes: [string, string][] = [
  ['/reference/api/v1', '/api'],
  ['/reference/api', '/api'],
  ['/reference/cli', '/cli'],
  ['/reference/sdk/nextjs', '/nextjs'],
  ['/reference/sdk/react', '/react'],
  ['/reference/sdk/shadcn', '/shadcn'],
  ['/components', '/shadcn'],
];

const versionPattern = /^\d+\.\d+\.\d+/;

function isSection(segment: string | undefined): segment is Section {
  return segment !== undefined && Object.hasOwn(versions, segment);
}

export function resolveRedirect(
  pathname: string,
  versionAliases: Partial<Record<string, Record<string, string>>> = aliases,
): string | null {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (exact[path]) return exact[path];

  let rewritten = path;
  for (const [from, to] of prefixes) {
    if (path === from || path.startsWith(`${from}/`)) {
      rewritten = to + path.slice(from.length);
      break;
    }
  }

  const segments = rewritten.split('/').slice(1);
  const [section, version] = segments;
  if (!isSection(section)) return rewritten === path ? null : rewritten;

  const latest = versions[section];
  if (version === undefined || version === 'latest') {
    segments.splice(1, 1, latest);
  } else if (!versionPattern.test(version)) {
    segments.splice(1, 0, latest);
  } else if (versionAliases[section]?.[version]) {
    segments.splice(1, 1, versionAliases[section][version]);
  }

  const target = `/${segments.join('/')}`;
  return target === path ? null : target;
}
