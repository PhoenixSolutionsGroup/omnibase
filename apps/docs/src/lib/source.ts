import { docs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
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
