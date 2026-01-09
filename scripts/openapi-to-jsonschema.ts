#!/usr/bin/env bun
/**
 * Generates JSON Schema from OpenAPI stripe schema.
 *
 * Usage: bun scripts/openapi-to-jsonschema.ts
 *
 * This script:
 * 1. Reads the OpenAPI stripe.yaml schema
 * 2. Converts it to JSON Schema format using @openapi-contrib/openapi-schema-to-json-schema
 * 3. Transforms $refs and restructures for standalone JSON Schema use
 * 4. Outputs to apps/api/internal/static/stripe-config-schema.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { load } from 'js-yaml';
import { execSync } from 'child_process';

const OPENAPI_YAML = 'apps/api/docs/schemas/stripe.yaml';
const TMP_JSON = '/tmp/stripe-openapi.json';
const TMP_CONVERTED = '/tmp/stripe-converted.json';
const OUTPUT_FILE = 'apps/api/internal/static/stripe-config-schema.json';

console.log('🔄 Step 1: Converting OpenAPI YAML to JSON...');
const yaml = readFileSync(OPENAPI_YAML, 'utf8');
const openapi = load(yaml);
writeFileSync(TMP_JSON, JSON.stringify(openapi, null, 2));

console.log('🔄 Step 2: Converting OpenAPI schema to JSON Schema...');
execSync(`bunx @openapi-contrib/openapi-schema-to-json-schema -f ${TMP_JSON} -o ${TMP_CONVERTED}`, {
  stdio: 'inherit'
});

console.log('🔄 Step 3: Transforming to standalone JSON Schema...');
const input = JSON.parse(readFileSync(TMP_CONVERTED, 'utf8'));
const schemas = input.components.schemas;

// Function to recursively transform refs and clean up
function transformRefs(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(transformRefs);
  }

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === '$ref' && typeof value === 'string') {
      // Transform #/components/schemas/X to #/definitions/X
      result[key] = value.replace('#/components/schemas/', '#/definitions/');
    } else if (key === 'example' || key === 'examples') {
      // Skip example fields - not needed for validation
      continue;
    } else {
      result[key] = transformRefs(value);
    }
  }
  return result;
}

// Transform all schemas
const definitions: any = {};
for (const [name, schema] of Object.entries(schemas)) {
  definitions[name] = transformRefs(schema);
}

// Build the final JSON Schema with StripeConfiguration as root
const stripeConfig = transformRefs(schemas.StripeConfiguration);

const jsonSchema = {
  '$schema': 'http://json-schema.org/draft-07/schema#',
  '$id': 'https://omnibase.dev/schemas/stripe-config.json',
  'title': 'Stripe Configuration Schema',
  'description': 'Schema for Stripe product and pricing configuration',
  'type': stripeConfig.type,
  'required': stripeConfig.required,
  'properties': stripeConfig.properties,
  'definitions': definitions
};

writeFileSync(OUTPUT_FILE, JSON.stringify(jsonSchema, null, 2));

console.log(`✅ Done! Schema written to ${OUTPUT_FILE}`);
