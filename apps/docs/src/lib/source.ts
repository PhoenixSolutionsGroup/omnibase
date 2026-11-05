import { docs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import type * as PageTree from 'fumadocs-core/page-tree';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { openapiPlugin } from 'fumadocs-openapi/server';
import versions from '../../content/versions.json';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin(), openapiPlugin()],
});

const versionedSections = new Set(['api', 'cli', 'nextjs', 'react', 'shadcn']);

export function isLatestVersionPage(page: InferPageType<typeof source>) {
  const [section, version] = page.slugs;
  if (!section || !versionedSections.has(section)) return true;
  return versions[section as keyof typeof versions] === version;
}

export function getPageImage(page: InferPageType<typeof source>) {
  const slugs = [...page.slugs];
  const [section, version] = slugs;

  if (
    section &&
    version &&
    versionedSections.has(section) &&
    versions[section as keyof typeof versions] !== version
  ) {
    slugs[1] = versions[section as keyof typeof versions];
  }

  const segments = [...slugs, 'image.png'];

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title}

${processed}`;
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

export function getPageTreeFor(page: InferPageType<typeof source>): PageTree.Root {
  const tree = source.getPageTree();
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
    children: tree.children.map((child) => pruneNode(child, active, projected)),
  };
}
