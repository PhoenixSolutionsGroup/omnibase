import { isLatestVersionPage, source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

export const dynamic = 'force-static';
export const revalidate = false;

const latestSource: typeof source = {
  ...source,
  getPages: (...args) => source.getPages(...args).filter(isLatestVersionPage),
};

export const { staticGET: GET } = createFromSource(latestSource, {
  language: 'english',
});
