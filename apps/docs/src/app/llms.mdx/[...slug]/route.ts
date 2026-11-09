import { docsLlms, isLatestVersionPage, source } from '@/lib/source';

export const dynamic = 'force-static';
export const revalidate = false;

export function generateStaticParams() {
  return source
    .getPages()
    .filter(isLatestVersionPage)
    .map((page) => ({
      slug: [
        ...page.slugs.slice(0, -1),
        `${page.slugs.at(-1)}.md`,
      ],
    }));
}

export async function GET(
  _request: Request,
  { params }: RouteContext<'/llms.mdx/[...slug]'>
) {
  const { slug } = await params;
  const pageSlug = [
    ...slug.slice(0, -1),
    slug.at(-1)?.replace(/\.md$/, ''),
  ].filter((segment): segment is string => Boolean(segment));
  const page = source.getPage(pageSlug);

  if (!page || !isLatestVersionPage(page)) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(await docsLlms.page(page), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
