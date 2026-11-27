'use client';
import { createOpenAPIPage } from 'fumadocs-openapi/ui';
import { loadOpenAPIDocument } from '@/generated/openapi-specs';

export const OpenAPIPage = createOpenAPIPage({ loadDocument: loadOpenAPIDocument });
