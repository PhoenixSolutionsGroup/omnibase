#!/usr/bin/env bun
/**
 * API Route Audit Script
 *
 * Checks for mismatches between:
 *   A) Go route declarations (code) — routes implemented but undocumented
 *   B) OpenAPI docs (paths/*.yaml) — paths written but not wired into info.yaml
 *   C) Bundled OpenAPI spec — endpoints included in the SDK build
 *
 * Usage: bun scripts/audit-routes.ts
 *
 * Exit codes:
 *   0 — no issues found
 *   1 — issues found
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { load } from "js-yaml";

const ROOT = dirname(dirname(import.meta.path));

// ─── Types ───────────────────────────────────────────────────────────────────

interface Route {
  method: string;
  path: string;
  source: string;
  line: number;
}

interface Issue {
  kind: "MISSING_FROM_OPENAPI" | "MISSING_FROM_INFO_YAML" | "UNUSED_OPENAPI_PATH";
  message: string;
  detail: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function joinPaths(parent: string, child: string): string {
  if (!parent) return child;
  if (!child) return parent;
  const a = parent.endsWith("/") ? parent : parent;
  const b = child.startsWith("/") ? child : "/" + child;
  return a + b;
}

/** Normalise a path for comparison: convert :param → {param}, strip trailing slash. */
function normalisePath(p: string): string {
  return p
    .replace(/\/+$/, "")
    .replace(/:(\w+)/g, "{$1}")
    .replace(/\*(\w+)/g, "{$1}")
    .replace(/\/+$/, "");
}

/** Normalise a path as-listed (keep raw format for display). */
function normalisePathRaw(p: string): string {
  return p.replace(/\/+$/, "");
}

function relativePath(absolute: string): string {
  return absolute.replace(ROOT + "/", "");
}

/** Collect all Go route registrations from a single file. */
function extractRoutesFromFile(
  filePath: string,
  paramName: string,
  basePath: string,
): Route[] {
  const routes: Route[] = [];
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Track group variables → resolved path prefix
  const groups = new Map<string, string>();
  groups.set(paramName, basePath);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    const groupMatch =
      line.match(
        /^\s*(\w+)\s*:=\s*(\w+)\.Group\(`([^`]*)`\)/,
      ) ??
      line.match(/^\s*(\w+)\s*:=\s*(\w+)\.Group\("([^"]*)"\)/)

    if (groupMatch) {
      const [, varName, parentVar, prefix] = groupMatch;
      const parentPath = groups.get(parentVar);
      if (parentPath !== undefined) {
        groups.set(varName, joinPaths(parentPath, prefix));
      }
      continue;
    }

    const routeMatch =
      line.match(
        /^\s*(\w+)\.(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|Any)\(`([^`]*)`/,
      ) ??
      line.match(
        /^\s*(\w+)\.(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|Any)\("([^"]*)"/,
      );

    if (routeMatch) {
      const [, varName, method, path] = routeMatch;
      const resolvedPath = groups.get(varName);
      if (resolvedPath !== undefined) {
        routes.push({
          method: method === "Any" ? "*" : method,
          path: joinPaths(resolvedPath, path),
          source: relativePath(filePath),
          line: lineNum,
        });
      }
    }
  }

  return routes;
}

/** Parse InitRoutes to extract SetUp function → group prefix mapping. */
function parseInitRoutes(
  filePath: string,
): { funcName: string; paramName: string; prefix: string }[] {
  const content = readFileSync(filePath, "utf-8");
  const results: { funcName: string; paramName: string; prefix: string }[] = [];
  const regex = /(\w+)\((\w+)\.Group\((?:`([^`]+)`|"([^"]+)")\s*\)\s*\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    results.push({
      funcName: match[1],
      paramName: match[2],
      prefix: match[3] ?? match[4],
    });
  }
  return results;
}

/** Get all Go routes from the API server code. */
function getGoRoutes(): Route[] {
  const routes: Route[] = [];
  const routesDir = join(ROOT, "apps/api/internal/routes");
  const mainGo = join(ROOT, "apps/api/main.go");
  const mainContent = readFileSync(mainGo, "utf-8");

  // Determine v1 base path
  const v1GroupMatch = mainContent.match(
    /v1_group\s*:=\s*r\.Group\("([^"]+)"\)/,
  );
  const v1BasePath = v1GroupMatch ? v1GroupMatch[1] : "/api/v1";

  // Build mapping of SetUp function name → prefix from InitRoutes
  const initRoutesFile = join(routesDir, "v1/main.go");
  const setUpPrefix = new Map<string, string>();
  for (const m of parseInitRoutes(initRoutesFile)) {
    setUpPrefix.set(m.funcName, v1BasePath + m.prefix);
  }

  // Recursively find all .go files under routes/
  function scanDir(dir: string): string[] {
    const files: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) files.push(...scanDir(full));
      else if (entry.name.endsWith(".go")) files.push(full);
    }
    return files;
  }

  for (const file of scanDir(routesDir)) {
    const content = readFileSync(file, "utf-8");
    // Find the first SetUp*Routes function and get its parameter name
    const funcMatch = content.match(
      /func\s+(SetUp\w+Routes)\((\w+)\s+\*gin\.RouterGroup\)/,
    );
    if (!funcMatch) continue;
    const funcName = funcMatch[1];
    const paramName = funcMatch[2];
    const basePath = setUpPrefix.get(funcName);
    if (!basePath) continue; // not wired into InitRoutes

    routes.push(...extractRoutesFromFile(file, paramName, basePath));
  }

  // Routes in main.go (health, self-service proxy, etc.)
  const mainLines = mainContent.split("\n");
  for (let i = 0; i < mainLines.length; i++) {
    const m = mainLines[i].match(
      /^\s*r\.(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|Any)\("([^"]+)"/,
    );
    if (m) {
      routes.push({
        method: m[1] === "Any" ? "*" : m[1],
        path: joinPaths("", m[2]),
        source: relativePath(mainGo),
        line: i + 1,
      });
    }
  }

  return routes;
}

/** Get all paths/methods from the bundled OpenAPI spec. */
function getOpenAPIRoutes(): Route[] {
  const routes: Route[] = [];
  const specPath = join(ROOT, "apps/api/docs/openapi.yaml");
  if (!existsSync(specPath)) return routes;

  const spec = load(readFileSync(specPath, "utf-8")) as any;
  if (!spec?.paths) return routes;

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const method of ["get", "post", "put", "delete", "patch", "head", "options"] as const) {
      if ((methods as any)[method]) {
        routes.push({
          method: method.toUpperCase(),
          path: normalisePathRaw(path),
          source: relativePath(specPath),
          line: 0,
        });
      }
    }
  }

  return routes;
}

/** Get all path references from info.yaml (the entry point for bundling). */
function getInfoYAMLPaths(): string[] {
  const infoPath = join(ROOT, "apps/api/docs/info.yaml");
  if (!existsSync(infoPath)) return [];

  const info = load(readFileSync(infoPath, "utf-8")) as any;
  if (!info?.paths) return [];

  return Object.keys(info.paths).map(normalisePath);
}

/** Get all path definitions from docs/paths/*.yaml files. */
function getDocPathFilesPaths(): { path: string; file: string }[] {
  const result: { path: string; file: string }[] = [];
  const pathsDir = join(ROOT, "apps/api/docs/paths");
  if (!existsSync(pathsDir)) return result;

  for (const file of readdirSync(pathsDir).filter((f) => f.endsWith(".yaml"))) {
    const spec = load(readFileSync(join(pathsDir, file), "utf-8")) as any;
    if (!spec?.paths) continue;
    for (const p of Object.keys(spec.paths)) {
      result.push({ path: normalisePath(p), file: relativePath(join(pathsDir, file)) });
    }
  }

  return result;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  let issues: Issue[] = [];

  // 1. Parse Go routes
  const goRoutes = getGoRoutes();
  // 2. Parse OpenAPI routes
  const openAPIRoutes = getOpenAPIRoutes();

  // Build lookup maps: normalised path → set of methods (for Go *-method matching)
  const oapiByPath = new Map<string, Set<string>>();
  for (const r of openAPIRoutes) {
    const n = normalisePath(r.path);
    if (!oapiByPath.has(n)) oapiByPath.set(n, new Set());
    oapiByPath.get(n)!.add(r.method);
  }

  function isInOpenAPI(method: string, path: string): boolean {
    const n = normalisePath(path);
    const methods = oapiByPath.get(n);
    if (!methods) return false;
    // Gin Any() (*) matches every method
    if (method === "*") return true;
    return methods.has(method);
  }

  // ── A: Routes in Go but missing from OpenAPI ──────────────────────────────
  for (const r of goRoutes) {
    if (isInOpenAPI(r.method, r.path)) continue;
    // Skip intentionally undocumented routes
    if (r.method === "*") continue;                         // Gin Any() — Kratos proxies
    if (r.path === "/health" || r.path === "/health/ready") continue;  // k8s probes
    issues.push({
      kind: "MISSING_FROM_OPENAPI",
      message: `${r.method} ${r.path}`,
      detail: `Defined at ${r.source}:${r.line} but not found in bundled OpenAPI spec.`,
    });
  }

  // ── B: Paths in docs/paths/*.yaml not wired into info.yaml ───────────────
  const infoPaths = new Set(getInfoYAMLPaths().map(normalisePath));
  const docPaths = getDocPathFilesPaths();

  for (const { path, file } of docPaths) {
    if (!infoPaths.has(normalisePath(path))) {
      issues.push({
        kind: "MISSING_FROM_INFO_YAML",
        message: path,
        detail: `Defined in ${file} but not referenced in docs/info.yaml — will NOT appear in OpenAPI bundle or SDK.`,
      });
    }
  }

  // ── C: OpenAPI paths with no matching Go route ───────────────────────────
  const goByPath = new Map<string, Set<string>>();
  for (const r of goRoutes) {
    const n = normalisePath(r.path);
    if (!goByPath.has(n)) goByPath.set(n, new Set());
    goByPath.get(n)!.add(r.method);
  }
  function isInGo(method: string, path: string): boolean {
    const n = normalisePath(path);
    const methods = goByPath.get(n);
    if (!methods) return false;
    if (methods.has("*")) return true;
    return methods.has(method);
  }

  for (const r of openAPIRoutes) {
    if (isInGo(r.method, r.path)) continue;
    issues.push({
      kind: "UNUSED_OPENAPI_PATH",
      message: `${r.method} ${r.path}`,
      detail: `Documented but no matching Go route handler was found.`,
    });
  }

  // ── Report ───────────────────────────────────────────────────────────────
  if (issues.length === 0) {
    console.log("✅ All routes are documented and wired correctly.");
    process.exit(0);
  }

  const categories = {
    MISSING_FROM_OPENAPI: "Routes in Go but missing from OpenAPI",
    MISSING_FROM_INFO_YAML: "Paths documented but not wired into info.yaml",
    UNUSED_OPENAPI_PATH: "OpenAPI paths with no matching Go route",
  } as const;

  for (const [kind, title] of Object.entries(categories)) {
    const group = issues.filter((i) => i.kind === kind);
    if (group.length === 0) continue;
    console.log(`\n❌ ${title} (${group.length}):\n`);
    for (const issue of group) {
      console.log(`  ${issue.message}`);
      console.log(`    ${issue.detail}\n`);
    }
  }

  process.exit(1);
}

main();
