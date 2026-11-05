import { docsLlms, isLatestVersionPage, source } from '@/lib/source';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  const pages = await Promise.all(
    source
      .getPages()
      .filter(isLatestVersionPage)
      .map(async (page) => ({
        title: page.data.title,
        url: page.url,
        path: page.slugs.join('/'),
        description: page.data.description,
        content: await docsLlms.page(page),
      }))
  );

  return Response.json(pages);
}
