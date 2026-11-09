'use client';
import { createOpenAPIPage } from 'fumadocs-openapi/ui';

type LoadDocument = NonNullable<
  NonNullable<Parameters<typeof createOpenAPIPage>[0]>['loadDocument']
>;

let documentPromise: ReturnType<LoadDocument> | undefined;

const loadDocument: LoadDocument = () => {
  documentPromise ??= (async () => {
    const document = await (typeof window === 'undefined'
      ? import('../../openapi.json').then((module) => module.default)
      : fetch('/openapi.json').then((response) => {
          if (!response.ok) {
            throw new Error(
              `Failed to load OpenAPI document: ${response.status}`,
            );
          }

          return response.json();
        }));

    return document as Awaited<ReturnType<LoadDocument>>;
  })();

  return documentPromise;
};

export const OpenAPIPage = createOpenAPIPage({ loadDocument });
