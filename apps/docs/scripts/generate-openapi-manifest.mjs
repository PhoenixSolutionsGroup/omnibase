import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const docsRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const specsDir = join(docsRoot, "openapi");
const outFile = join(docsRoot, "src/generated/openapi-specs.ts");

const files = existsSync(specsDir)
	? readdirSync(specsDir).filter((file) => file.endsWith(".json"))
	: [];
files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const entries = files.map(
	(file) =>
		`  './openapi/${file}': () =>\n    import('../../openapi/${file}').then((module) => module.default as unknown as Document),`,
);

const content = [
	'import type { Document } from "fumadocs-openapi";',
	"",
	"export const openapiSpecs: Record<string, () => Promise<Document>> = {",
	...entries,
	"};",
	"",
	"export function loadOpenAPIDocument(id: string): Promise<Document> {",
	"  const load = openapiSpecs[id];",
	"  if (!load) return Promise.reject(new Error(`Unknown OpenAPI document: ${id}`));",
	"  return load();",
	"}",
	"",
].join("\n");

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, content);
console.log(
	`Wrote ${files.length} OpenAPI document(s) to src/generated/openapi-specs.ts`,
);
