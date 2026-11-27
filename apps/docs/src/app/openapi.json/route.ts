import { readFileSync } from "node:fs";
import { join } from "node:path";
import { openapi } from "@/lib/openapi";

const contentDir = join(process.cwd(), "content");

const versions = JSON.parse(
	readFileSync(join(contentDir, "versions.json"), "utf8"),
) as { api: string };

const aliases = JSON.parse(
	readFileSync(join(contentDir, "version-aliases.json"), "utf8"),
) as Record<string, Record<string, string>>;

function resolveLatest(version: string): string {
	const seen = new Set<string>();
	let current = version;
	while (!seen.has(current)) {
		seen.add(current);
		const next = aliases.api?.[current];
		if (!next) return current;
		current = next;
	}
	return current;
}

export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
	const version = resolveLatest(versions.api);
	const { bundled } = await openapi.getSchema(`./openapi/${version}.json`);

	return Response.json(bundled);
}
