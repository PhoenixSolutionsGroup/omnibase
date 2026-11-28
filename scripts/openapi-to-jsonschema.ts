#!/usr/bin/env bun
/**
 * Generates the standalone Stripe configuration JSON Schema from the generated OpenAPI document.
 *
 * Usage: bun scripts/openapi-to-jsonschema.ts
 */

import { readFileSync, writeFileSync } from "node:fs";

const OPENAPI_FILE = "apps/api/docs/openapi.json";
const OUTPUT_FILE = "apps/api/internal/static/stripe-config-schema.json";
const ROOT_SCHEMA = "StripeConfiguration";

type Schema = Record<string, unknown>;

const spec = JSON.parse(readFileSync(OPENAPI_FILE, "utf8"));
const schemas: Record<string, Schema> = spec.components?.schemas ?? {};

if (!schemas[ROOT_SCHEMA]) {
	throw new Error(`Missing ${ROOT_SCHEMA} in ${OPENAPI_FILE}`);
}

const referenced = new Set<string>();

function collect(name: string) {
	if (referenced.has(name)) return;
	referenced.add(name);
	walk(schemas[name]);
}

function walk(value: unknown) {
	if (Array.isArray(value)) {
		for (const item of value) walk(item);
		return;
	}
	if (!value || typeof value !== "object") return;

	for (const [key, child] of Object.entries(value)) {
		if (key === "$ref" && typeof child === "string") {
			const prefix = "#/components/schemas/";
			if (child.startsWith(prefix)) collect(child.slice(prefix.length));
			continue;
		}
		walk(child);
	}
}

function transform(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(transform);
	if (!value || typeof value !== "object") return value;

	const result: Record<string, unknown> = {};
	for (const [key, child] of Object.entries(value)) {
		if (key === "example" || key === "examples") continue;
		if (key === "$ref" && typeof child === "string") {
			result[key] = child.replace("#/components/schemas/", "#/definitions/");
			continue;
		}
		result[key] = transform(child);
	}
	return result;
}

collect(ROOT_SCHEMA);

const definitions: Record<string, unknown> = {};
for (const name of referenced) {
	definitions[name] = transform(schemas[name]);
}

const root = transform(schemas[ROOT_SCHEMA]) as Schema;

const jsonSchema = {
	$schema: "http://json-schema.org/draft-07/schema#",
	$id: "https://omnibase.dev/schemas/stripe-config.json",
	title: "Stripe Configuration Schema",
	description: "Schema for Stripe product and pricing configuration",
	type: root.type,
	required: root.required,
	properties: root.properties,
	definitions,
};

writeFileSync(OUTPUT_FILE, `${JSON.stringify(jsonSchema, null, 2)}\n`);
console.log(`✅ Schema written to ${OUTPUT_FILE}`);
