import { createOpenAPI } from 'fumadocs-openapi/server';
import { openapiSpecs } from '@/generated/openapi-specs';

export const openapi = createOpenAPI({
  input: openapiSpecs,
  includeDocument: false,
});
