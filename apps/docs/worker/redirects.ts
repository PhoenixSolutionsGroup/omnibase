import aliasManifest from '../content/version-aliases.json';
import fallbackManifest from '../content/version-fallbacks.json';
import versionData from '../content/versions.json';

type Section = 'api' | 'cli' | 'nextjs' | 'react' | 'shadcn';
type VersionAliases = Partial<Record<string, Record<string, string>>>;
type VersionFallbacks = Partial<Record<string, Record<string, Record<string, string>>>>;

const versions = versionData as Partial<Record<Section, string>>;

const aliases: VersionAliases = aliasManifest;

const fallbacks: VersionFallbacks = fallbackManifest;

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

const versionPattern = /^(?:dev|\d+\.\d+\.\d+)/;
const sections = new Set(['api', 'cli', 'nextjs', 'react', 'shadcn']);

function isSection(segment: string | undefined): segment is Section {
  return segment !== undefined && sections.has(segment);
}

function fallbackKey(rest: string): string {
  return rest
    .replace(/\/+$/, '')
    .replace(/\.md$/, '')
    .replace(/\/image\.png$/, '');
}

const wrappers = ['/llms.mdx', '/og/docs'];

export function resolveRedirect(
  pathname: string,
  versionAliases: VersionAliases = aliases,
  latestVersions: Partial<Record<Section, string>> = versions,
  versionFallbacks: VersionFallbacks = fallbacks,
): string | null {
  const trimmed = pathname.replace(/\/+$/, '') || '/';
  const wrapper = wrappers.find(
    (prefix) => trimmed === prefix || trimmed.startsWith(`${prefix}/`),
  );
  const path = wrapper ? trimmed.slice(wrapper.length) || '/' : trimmed;
  const wrap = (target: string) => (wrapper ? wrapper + target : target);

  if (exact[path]) return wrap(exact[path]);

  let rewritten = path;
  for (const [from, to] of prefixes) {
    if (path === from || path.startsWith(`${from}/`)) {
      rewritten = to + path.slice(from.length);
      break;
    }
  }

  const segments = rewritten.split('/').slice(1);
  const [section, version] = segments;
  if (!isSection(section)) {
    const target = wrap(rewritten);
    return target === trimmed ? null : target;
  }

  const latest = latestVersions[section] ?? 'dev';
  if (version === undefined && rewritten === path) {
    return null;
  } else if (version === undefined || version === 'latest') {
    segments.splice(1, 1, latest);
  } else if (!versionPattern.test(version)) {
    segments.splice(1, 0, latest);
  } else if (versionAliases[section]?.[version]) {
    segments.splice(1, 1, versionAliases[section][version]);
  } else {
    const rest = segments.slice(2).join('/');
    const fallback = versionFallbacks[section]?.[version]?.[fallbackKey(rest)];
    if (fallback) {
      segments.splice(1, 1, fallback);
    }
  }

  const target = wrap(`/${segments.join('/')}`);
  return target === trimmed ? null : target;
}
