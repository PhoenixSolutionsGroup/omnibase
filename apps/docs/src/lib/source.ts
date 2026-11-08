import { docs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, loader, llms } from 'fumadocs-core/source';
import type * as PageTree from 'fumadocs-core/page-tree';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { openapiPlugin } from 'fumadocs-openapi/server';
import versionData from '../../content/versions.json';
import apiLlms from '../../content/api-llms.json';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin(), openapiPlugin()],
});

const versions = versionData as Partial<Record<string, string>>;
const versionedSections = new Set(['api', 'cli', 'nextjs', 'react', 'shadcn']);

export function isLatestVersionPage(page: InferPageType<typeof source>) {
  const [section, version] = page.slugs;
  if (!section || !versionedSections.has(section)) return true;
  if (!version || version === 'dev') return true;
  return versions[section] === version;
}

export function getPageImage(page: InferPageType<typeof source>) {
  const slugs = [...page.slugs];
  const [section, version] = slugs;

  const latest = section ? versions[section] : undefined;
  if (
    section &&
    version &&
    latest &&
    version !== 'dev' &&
    versionedSections.has(section) &&
    latest !== version
  ) {
    slugs[1] = latest;
  }

  const segments = [...slugs, 'image.png'];

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  };
}

type TreeFolder = PageTree.Folder;

function collectItems(folder: TreeFolder, out: PageTree.Item[] = []): PageTree.Item[] {
  if (folder.index) out.push(folder.index);
  for (const child of folder.children) {
    if (child.type === 'page') out.push(child);
    if (child.type === 'folder') collectItems(child, out);
  }
  return out;
}

function findPath(nodes: PageTree.Node[], url: string): PageTree.Node[] | undefined {
  for (const node of nodes) {
    if (node.type === 'page' && node.url === url) return [node];
    if (node.type !== 'folder') continue;
    if (node.index?.url === url) return [node, node.index];
    const rest = findPath(node.children, url);
    if (rest) return [node, ...rest];
  }
}

function relativeRef(folder: TreeFolder, item: PageTree.Item): string | undefined {
  const prefix = folder.$ref && `${folder.$ref.folder}/`;
  if (prefix && item.$ref?.startsWith(prefix)) return item.$ref.slice(prefix.length);
}

function collapseRoot(folder: TreeFolder, projected: Set<string>): TreeFolder {
  const items = collectItems(folder);
  const kept = items.filter((item) => {
    const ref = relativeRef(folder, item);
    return item !== folder.index && ref !== undefined && projected.has(ref);
  });
  if (!folder.index && kept.length === 0) {
    const first = items.find((item) => !item.external);
    if (first) kept.push(first);
  }
  return { ...folder, children: kept };
}

function pruneNode(
  node: PageTree.Node,
  active: Set<PageTree.Node>,
  projected: Set<string>,
): PageTree.Node {
  if (node.type !== 'folder') return node;
  if (node.root && !active.has(node)) return collapseRoot(node, projected);
  return {
    ...node,
    children: node.children.map((child) => pruneNode(child, active, projected)),
  };
}

function withChangelogTabs(tree: PageTree.Root): PageTree.Root {
  return {
    ...tree,
    children: tree.children.map((node) => {
      if (node.type !== 'folder' || node.root !== true) return node;
      const isLanding = (item: PageTree.Node): item is PageTree.Item =>
        item.type === 'page' && versionedSections.has(item.url.slice(1));
      const landing = node.index && isLanding(node.index) ? node.index : node.children.find(isLanding);
      if (!landing) return node;
      const changelog: TreeFolder = {
        type: 'folder',
        $id: `${node.$id ?? landing.url}:changelog`,
        name: 'Changelog',
        root: landing.url.slice(1),
        children: [{ ...landing, name: 'Changelog' }],
      };
      return {
        ...node,
        index: node.index === landing ? undefined : node.index,
        children: [...node.children.filter((child) => child !== landing), changelog],
      };
    }),
  };
}

export function getPageTreeFor(page: InferPageType<typeof source>): PageTree.Root {
  const tree = withChangelogTabs(source.getPageTree());
  const path = findPath(tree.children, page.url) ?? [];
  const item = path.at(-1);
  const projected = new Set<string>();
  if (item?.type === 'page') {
    for (const node of path) {
      if (node.type !== 'folder' || !node.root) continue;
      const ref = relativeRef(node, item);
      if (ref) projected.add(ref);
    }
  }
  const active = new Set(path);
  return {
    ...tree,
    children: tree.children.map((child) =>
      renameApiOperation(pruneNode(child, active, projected))
    ),
  };
}

function firstPageUrl(nodes: PageTree.Node[]): string | undefined {
  for (const node of nodes) {
    if (node.type === 'page') return node.url;
    if (node.type === 'folder') {
      const url = node.index?.url ?? firstPageUrl(node.children);
      if (url) return url;
    }
  }
}

function operationName(url: string): string | undefined {
  const segments = url.split('/').filter(Boolean);
  if (segments[0] !== 'api' || segments.length < 4) return undefined;
  return segments.at(-1);
}

function renameApiOperation(node: PageTree.Node): PageTree.Node {
  if (node.type === 'page') {
    const name = operationName(node.url);
    return name && name !== node.name ? { ...node, name } : node;
  }
  if (node.type === 'folder') {
    return { ...node, children: node.children.map(renameApiOperation) };
  }
  return node;
}

function pruneLatestFolder(folder: TreeFolder): TreeFolder {
  const url = folder.index?.url ?? firstPageUrl(folder.children);
  const section = url?.split('/')[1];

  const children = folder.children.flatMap((child) => {
    if (
      child.type === 'folder' &&
      section &&
      versionedSections.has(section) &&
      typeof child.root === 'string' &&
      child.name !== 'dev' &&
      child.name !== versions[section]
    ) {
      return [];
    }

    return [child.type === 'folder' ? pruneLatestFolder(child) : child];
  });

  return { ...folder, children };
}

function pruneLatestTree(tree: PageTree.Root): PageTree.Root {
  return {
    ...tree,
    children: tree.children.map((child) =>
      child.type === 'folder' ? pruneLatestFolder(child) : child
    ),
  };
}

const latestSource = {
  ...source,
  getPages: (...args: Parameters<typeof source.getPages>) =>
    source.getPages(...args).filter(isLatestVersionPage),
  getPageTree: (...args: Parameters<typeof source.getPageTree>) =>
    pruneLatestTree(source.getPageTree(...args)),
} as typeof source;

export const docsLlms = llms(latestSource, {
  renderPage: async (page) => {
    const generated = apiLlms[page.url as keyof typeof apiLlms];
    if (generated) return generated;

    const processed = await page.data.getText('processed');
    const body = processed
      .replace(/^# .*\n+/, '')
      .replace(/\{\/\*\s*This file was generated by Fumadocs[\s\S]*?\*\/\}\n*/g, '')
      .replace(/<Cards>\s*<Card title="([^"]+)" href="([^"]+)" \/>\s*<\/Cards>/g, '[$1]($2)')
      .replace(/^<\/?Changelog(?:Filter|Entry)\b[^\n]*>\n+/gm, '')
      .trim();
    return `# ${page.data.title} (${page.url})\n\n${body}`;
  },
});
