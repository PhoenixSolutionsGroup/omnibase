import { getPageImage, isLatestVersionPage, source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { generate as DefaultImage } from 'fumadocs-ui/og';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/og/docs/[...slug]'>) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new ImageResponse(
    <DefaultImage title={page.data.title} description={page.data.description} site="My App" />,
    {
      width: 1200,
      height: 630,
    },
  );
}

export function generateStaticParams() {
  const params = new Map<
    string,
    { lang: string | undefined; slug: string[] }
  >();

  for (const page of source.getPages().filter(isLatestVersionPage)) {
    const slug = getPageImage(page).segments;
    params.set(slug.join('/'), { lang: page.locale, slug });
  }

  return [...params.values()];
}
