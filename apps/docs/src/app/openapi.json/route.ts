import { openapi } from '@/lib/openapi';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  const { bundled } = await openapi.getSchema('./openapi.yaml');

  return Response.json(bundled);
}
