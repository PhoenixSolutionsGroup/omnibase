#!/usr/bin/env bun
/**
 * Documentation Generation Script
 *
 * Generates documentation from:
 * 1. TypeDoc for SDK packages (framework/*, component/*)
 * 2. TypeDoc for CLI
 * 3. OpenAPI spec for API reference (uses existing bundle-openapi.sh)
 *
 * Output goes to apps/docs/content/docs/
 */

import { spawn } from "bun";
import { rm, mkdir, readdir, readFile, writeFile, rename } from "fs/promises";
import { join, dirname, basename } from "path";
import { existsSync } from "fs";
import { execFileSync } from "node:child_process";
import { type Command } from "commander";

import { program } from "../packages/cli/src/index";
import { generateChangelogs } from "./generate-changelogs";

const ROOT = dirname(dirname(import.meta.path));
const DOCS_CONTENT = join(ROOT, "apps/docs/content/docs");

interface TypeDocTarget {
  name: string;
  title: string;
  description: string;
  icon: string;
  packagePath: string;
  entryPoints: string[];
  outputDir: string;
  versioned?: boolean;
  versionEnv?: string;
  tagPrefix?: string;
}

const TYPEDOC_TARGETS: TypeDocTarget[] = [
  {
    name: "@omnibase/nextjs",
    title: "Next.js",
    description: "Authentication, session, and middleware helpers for Next.js",
    icon: "Layers",
    packagePath: "sdk/framework/nextjs",
    entryPoints: ["src/auth/index.ts", "src/middleware/index.ts"],
    outputDir: "nextjs",
    versioned: true,
    versionEnv: "NEXTJS_VERSION",
    tagPrefix: "nextjs",
  },
  {
    name: "@omnibase/react",
    title: "React",
    description: "Hooks and components for authenticated React interfaces",
    icon: "Atom",
    packagePath: "sdk/framework/react",
    entryPoints: ["src/index.ts"],
    outputDir: "react",
    versioned: true,
    versionEnv: "REACT_VERSION",
    tagPrefix: "react",
  },
  {
    name: "@omnibase/shadcn",
    title: "Shadcn",
    description: "Pre-built UI components for authentication and tenant management",
    icon: "Component",
    packagePath: "sdk/component/shadcn",
    entryPoints: ["src/index.ts"],
    outputDir: "shadcn",
    versioned: true,
    versionEnv: "SHADCN_VERSION",
    tagPrefix: "shadcn",
  },
];

async function run(cmd: string[], cwd?: string): Promise<void> {
  const proc = spawn({
    cmd,
    cwd: cwd ?? ROOT,
    stdout: "inherit",
    stderr: "inherit",
  });
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(`Command failed: ${cmd.join(" ")}`);
  }
}

async function cleanOutputDir(dir: string): Promise<void> {
  const fullPath = join(DOCS_CONTENT, dir);
  if (existsSync(fullPath)) {
    await rm(fullPath, { recursive: true });
  }
  await mkdir(fullPath, { recursive: true });
}

/**
 * Clean up TypeDoc output:
 * - Rename README.md to index.md (Fumadocs uses index for folder landing pages)
 * - Remove globals.md (usually empty/duplicate)
 * - Remove modules.md (redundant index)
 */
async function cleanupTypedocOutput(dir: string): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Remove _media directories (TypeDoc copies source files that have broken imports)
      if (entry.name === "_media") {
        await rm(fullPath, { recursive: true });
        continue;
      }
      await cleanupTypedocOutput(fullPath);
    } else if (entry.name === "README.md") {
      // Rename README.md to index.md
      const indexPath = join(dir, "index.md");
      const content = await readFile(fullPath, "utf-8");
      await writeFile(indexPath, content);
      await rm(fullPath);
    } else if (entry.name === "globals.md" || entry.name === "modules.md") {
      // Remove globals.md and modules.md (redundant)
      await rm(fullPath);
    }
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function resolveVersion(envName: string, tagPrefix: string): string {
  const explicit = process.env[envName];
  if (explicit && explicit !== "0.0.0-dev") return explicit;

  if (process.env.GITHUB_ACTIONS) {
    try {
      const tag = execFileSync(
        "git",
        ["describe", "--tags", "--match", `${tagPrefix}-v*`, "--abbrev=0"],
        { cwd: ROOT, encoding: "utf-8" }
      ).trim();
      const match = tag.match(new RegExp(`^${tagPrefix}-v(.+)$`));
      if (match) return match[1]!;
    } catch {
      return "dev";
    }
  }

  return "dev";
}

/**
 * Split markdown files by H2 headings (@group tags) into separate files
 * e.g., auth.md with ## Authentication, ## Flow Retrieval becomes:
 *   auth/index.md (H1 + overview content before first H2)
 *   auth/authentication.md
 *   auth/flow-retrieval.md
 */
async function splitByH2Headings(dir: string): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await splitByH2Headings(fullPath);
    } else if (
      entry.name.endsWith(".md") &&
      entry.name !== "index.md" &&
      entry.name !== "README.md"
    ) {
      await splitMarkdownByH2(fullPath);
    }
  }
}

async function splitMarkdownByH2(filePath: string): Promise<void> {
  const content = await readFile(filePath, "utf-8");
  const lines = content.split("\n");

  // Find H1 title and all H2 headings with their positions
  // Only consider H2s that are TypeDoc @group sections (followed by ### headers)
  const h2Sections: { title: string; startLine: number }[] = [];
  let h1Title = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.startsWith("# ") && !h1Title) {
      h1Title = line.slice(2).trim();
    } else if (line.startsWith("## ")) {
      // Check if this H2 is a TypeDoc @group section by looking for ### in the next ~20 lines
      // TypeDoc groups have H3 headers for functions/types, documentation H2s don't
      let isTypedocGroup = false;
      for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
        const nextLine = lines[j];
        if (nextLine?.startsWith("### ")) {
          isTypedocGroup = true;
          break;
        }
        // Stop if we hit another H2 (means no H3 in this section)
        if (nextLine?.startsWith("## ")) {
          break;
        }
      }

      if (isTypedocGroup) {
        h2Sections.push({
          title: line.slice(3).trim(),
          startLine: i,
        });
      }
    }
  }

  // Create directory for the module (auth.md → auth/index.md)
  const fileName = basename(filePath, ".md");
  const parentDir = dirname(filePath);
  const newDir = join(parentDir, fileName);
  await mkdir(newDir, { recursive: true });

  // If no H2 sections or only one, just move to index.md
  if (h2Sections.length <= 1) {
    await writeFile(join(newDir, "index.md"), content);
    await rm(filePath);

    // Create meta.json
    const metaContent = {
      title: h1Title || fileName,
    };
    await writeFile(
      join(newDir, "meta.json"),
      JSON.stringify(metaContent, null, 2)
    );
    return;
  }

  // Extract content before first H2 as index (includes H1)
  const firstSection = h2Sections[0]!;
  const overviewLines = lines.slice(0, firstSection.startLine);
  let indexContent = overviewLines.join("\n").trim();

  // Add links to sections
  indexContent += "\n\n## Sections\n\n";
  for (const section of h2Sections) {
    const slug = slugify(section.title);
    indexContent += `- [${section.title}](./${slug})\n`;
  }
  await writeFile(join(newDir, "index.md"), indexContent);

  // Extract each H2 section into its own file
  for (let i = 0; i < h2Sections.length; i++) {
    const section = h2Sections[i]!;
    const nextSection = h2Sections[i + 1];
    const endLine = nextSection ? nextSection.startLine : lines.length;

    const sectionLines = lines.slice(section.startLine, endLine);
    // Convert H2 to H1 for the split file
    sectionLines[0] = "# " + section.title;

    const sectionContent = sectionLines.join("\n").trim();
    const slug = slugify(section.title);
    await writeFile(join(newDir, `${slug}.md`), sectionContent);
  }

  // Remove original file
  await rm(filePath);

  // Create meta.json for the new directory
  // Note: Don't include "index" - Fumadocs handles it automatically
  const metaContent = {
    title: h1Title || fileName,
    pages: h2Sections.map((s) => slugify(s.title)),
  };
  await writeFile(
    join(newDir, "meta.json"),
    JSON.stringify(metaContent, null, 2)
  );
}

/**
 * Add frontmatter to generated markdown files
 * Fumadocs requires at least a `title` in frontmatter
 */
async function addFrontmatterToDir(dir: string): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await addFrontmatterToDir(fullPath);
    } else if (entry.name.endsWith(".md")) {
      await addFrontmatterToFile(fullPath);
    }
  }
}

async function addFrontmatterToFile(filePath: string): Promise<void> {
  const content = await readFile(filePath, "utf-8");

  // Skip if already has frontmatter
  if (content.startsWith("---")) {
    return;
  }

  // Extract title from first H1 or use filename
  const h1Match = content.match(/^#\s+(.+)$/m);
  let title = h1Match?.[1]
    ? h1Match[1].replace(/[`*]/g, "").trim()
    : basename(filePath, ".md");

  // Clean up title - remove package scope for cleaner display
  title = title.replace(/^@\w+\//, "");

  // Capitalize if it's a simple word
  if (title === "globals" || title === "modules") {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  // Handle README files
  if (basename(filePath) === "README.md") {
    // For README, use the H1 title or parent folder name
    if (!h1Match) {
      title = basename(dirname(filePath));
    }
  }

  const frontmatter = `---
title: "${title}"
---

`;

  await writeFile(filePath, frontmatter + content);
}

const VERSION_ALIASES = join(ROOT, "apps/docs/content/version-aliases.json");
const VERSION_DIR = /^\d+\.\d+\.\d+/;

type VersionAliases = Record<string, Record<string, string>>;

async function listFiles(dir: string, prefix = ""): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...(await listFiles(join(dir, entry.name), rel)));
    else files.push(rel);
  }
  return files.sort();
}

async function sameDocsExceptVersion(
  previousDir: string,
  previous: string,
  currentDir: string,
  current: string
): Promise<boolean> {
  const [previousFiles, currentFiles] = await Promise.all([
    listFiles(previousDir),
    listFiles(currentDir),
  ]);
  if (previousFiles.join("\n") !== currentFiles.join("\n")) return false;
  for (const file of currentFiles) {
    const [before, after] = await Promise.all([
      readFile(join(previousDir, file), "utf-8"),
      readFile(join(currentDir, file), "utf-8"),
    ]);
    if (before.replaceAll(previous, current) !== after) return false;
  }
  return true;
}

async function readVersionAliases(): Promise<VersionAliases> {
  if (!existsSync(VERSION_ALIASES)) return {};
  return JSON.parse(await readFile(VERSION_ALIASES, "utf-8")) as VersionAliases;
}

async function writeFileAtomic(path: string, content: string): Promise<void> {
  const tempPath = `${path}.tmp`;
  await writeFile(tempPath, content);
  await rename(tempPath, path);
}

/**
 * When a release leaves a section's docs unchanged, keep one copy under the
 * new version and redirect the previous version to it, so the release adds
 * no files to the deployed site.
 */
async function collapseUnchangedVersion(section: string, current: string): Promise<void> {
  if (current === "dev") return;

  const sectionDir = join(DOCS_CONTENT, section);
  const previous = (await readdir(sectionDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && VERSION_DIR.test(entry.name))
    .map((entry) => entry.name)
    .filter((name) => name.localeCompare(current, undefined, { numeric: true }) < 0)
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0];
  if (!previous) return;

  const previousDir = join(sectionDir, previous);
  const currentDir = join(sectionDir, current);
  if (!(await sameDocsExceptVersion(previousDir, previous, currentDir, current))) return;

  const aliases = await readVersionAliases();
  const sectionAliases = aliases[section] ?? {};
  for (const [from, to] of Object.entries(sectionAliases)) {
    if (to === previous) sectionAliases[from] = current;
  }
  sectionAliases[previous] = current;
  aliases[section] = sectionAliases;
  await writeFileAtomic(VERSION_ALIASES, JSON.stringify(aliases, null, 2) + "\n");

  await rm(previousDir, { recursive: true });

  console.log(`    ↪ ${section} ${previous} is unchanged, now redirects to ${current}`);
}

async function writeVersionedSection(
  target: TypeDocTarget,
  _currentVersion: string
): Promise<void> {
  const sectionDir = join(DOCS_CONTENT, target.outputDir);

  await writeFile(
    join(sectionDir, "meta.json"),
    JSON.stringify(
      {
        title: target.title,
        description: target.description,
        icon: target.icon,
        root: true,
        pages: ["index", "..."],
      },
      null,
      2
    )
  );
}

async function generateTypeDocs(): Promise<void> {
  console.log("\n📚 Generating TypeDoc documentation...\n");

  for (const target of TYPEDOC_TARGETS) {
    console.log(`  → ${target.name}`);

    const packageDir = join(ROOT, target.packagePath);
    const version = target.versioned
      ? resolveVersion(target.versionEnv!, target.tagPrefix!)
      : null;
    const outputDir = version
      ? join(target.outputDir, version)
      : target.outputDir;
    const outputPath = join(DOCS_CONTENT, outputDir);
    const tsconfigPath = join(packageDir, "tsconfig.json");

    // Clean and create output directory
    await cleanOutputDir(outputDir);

    // Build TypeDoc command
    const entryPointsArgs = target.entryPoints.flatMap((ep) => [
      "--entryPoints",
      join(packageDir, ep),
    ]);

    const typedocArgs = [
      "bunx",
      "typedoc",
      ...entryPointsArgs,
      "--plugin",
      "typedoc-plugin-markdown",
      "--out",
      outputPath,
      "--entryPointStrategy",
      "expand",
      "--hidePageHeader",
      "true",
      "--hideBreadcrumbs",
      "true",
      "--useCodeBlocks",
      "true",
      "--expandObjects",
      "true",
      "--parametersFormat",
      "table",
      "--interfacePropertiesFormat",
      "table",
      "--classPropertiesFormat",
      "table",
      "--enumMembersFormat",
      "table",
      "--typeDeclarationFormat",
      "table",
      "--propertyMembersFormat",
      "table",
      "--outputFileStrategy",
      "modules",
      "--flattenOutputFiles",
      "false",
      "--excludePrivate",
      "true",
      "--excludeProtected",
      "true",
      "--skipErrorChecking",
      "true",
      // Group items by kind (Functions, Types, etc.) within each @group
      "--groupOrder",
      "Functions,Classes,Interfaces,Type Aliases,Variables,*",
    ];

    // Add tsconfig if it exists
    if (existsSync(tsconfigPath)) {
      typedocArgs.push("--tsconfig", tsconfigPath);
    }

    try {
      await run(typedocArgs);
      // Clean up TypeDoc output (README.md → index.md, remove globals.md/modules.md)
      await cleanupTypedocOutput(outputPath);
      // Split files by H2 headings (@group tags) into separate pages
      await splitByH2Headings(outputPath);
      // Add frontmatter to generated files
      await addFrontmatterToDir(outputPath);
      if (version) {
        await writeFile(
          join(outputPath, "meta.json"),
          JSON.stringify(
            { title: version, root: basename(target.outputDir) },
            null,
            2
          )
        );
        await collapseUnchangedVersion(target.outputDir, version);
        await writeVersionedSection(target, version);
      }
      console.log(`    ✓ Generated docs for ${target.name}`);
    } catch (error) {
      console.error(`    ✗ Failed to generate docs for ${target.name}`);
      console.error(error);
      throw error;
    }
  }
}

interface OpenAPIParameter {
  name?: string;
  in?: string;
  required?: boolean;
  description?: string;
  schema?: unknown;
}

interface OpenAPIRequestBody {
  description?: string;
  required?: boolean;
  content?: Record<string, { schema?: unknown }>;
}

interface OpenAPIResponse {
  description?: string;
  content?: Record<string, { schema?: unknown; example?: unknown }>;
}

interface OpenAPIOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses?: Record<string, OpenAPIResponse>;
}

function jsonBlock(value: unknown): string {
  if (value === undefined) return "";
  return ["```json", JSON.stringify(value, null, 2), "```"].join("\n");
}

function dereferenceSchema(
  value: unknown,
  schemas: Record<string, unknown>,
  seen: Set<string> = new Set(),
  depth = 0
): unknown {
  if (depth > 8 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map((item) => dereferenceSchema(item, schemas, seen, depth + 1));
  }

  const object = value as Record<string, unknown>;
  const ref = object.$ref;
  if (typeof ref === "string") {
    const name = ref.match(/^#\/components\/schemas\/(.+)$/)?.[1];
    if (name) {
      if (seen.has(name)) return { $ref: ref };
      const schema = schemas[name];
      if (schema !== undefined) {
        const nextSeen = new Set(seen);
        nextSeen.add(name);
        return dereferenceSchema(schema, schemas, nextSeen, depth + 1);
      }
    }
  }

  const resolved: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(object)) {
    resolved[key] = dereferenceSchema(child, schemas, seen, depth + 1);
  }
  return resolved;
}

function renderOperationMarkdown(
  url: string,
  method: string,
  path: string,
  operation: OpenAPIOperation,
  schemas: Record<string, unknown>,
  pathParameters: OpenAPIParameter[]
): string {
  const lines = [
    `# ${operation.summary || operation.operationId} (${url})`,
    "",
    `\`${method.toUpperCase()} ${path}\``,
    "",
  ];

  if (operation.description) lines.push(operation.description, "");

  const seen = new Set<string>();
  const parameters = [...pathParameters, ...(operation.parameters ?? [])].filter(
    (parameter) => {
      const key = `${parameter.in}:${parameter.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }
  );

  if (parameters.length > 0) {
    lines.push("## Parameters", "");
    for (const parameter of parameters) {
      lines.push(
        `- \`${parameter.name}\` (${parameter.in}${
          parameter.required ? ", required" : ""
        }): ${parameter.description ?? ""}`
      );
    }
    lines.push("");
  }

  if (operation.requestBody) {
    lines.push("## Request body", "");
    if (operation.requestBody.description) {
      lines.push(operation.requestBody.description, "");
    }
    for (const [contentType, media] of Object.entries(
      operation.requestBody.content ?? {}
    )) {
      lines.push(`Content type: \`${contentType}\``, "");
      if (media.schema) {
        lines.push(jsonBlock(dereferenceSchema(media.schema, schemas)), "");
      }
    }
  }

  if (operation.responses) {
    lines.push("## Responses", "");
    for (const [status, response] of Object.entries(operation.responses)) {
      lines.push(`### ${status}`, "");
      if (response.description) lines.push(response.description, "");
      for (const media of Object.values(response.content ?? {})) {
        if (media.example !== undefined) {
          lines.push(jsonBlock(media.example), "");
        } else if (media.schema) {
          lines.push(jsonBlock(dereferenceSchema(media.schema, schemas)), "");
        }
      }
    }
  }

  return lines.join("\n").trim() + "\n";
}

async function generateOpenAPIDocs(): Promise<void> {
  console.log("\n📖 Generating OpenAPI documentation...\n");

  const openApiSource = join(ROOT, "apps/api/docs/openapi.json");
  const openApiDest = join(ROOT, "apps/docs/openapi.yaml");
  const openApiOutput = join(DOCS_CONTENT, "api");

  // Run existing bundle-openapi.sh script
  console.log("  → Bundling OpenAPI spec (using bundle-openapi.sh)...");
  await run(["./scripts/bundle-openapi.sh"]);

  if (!existsSync(openApiSource)) {
    console.error("  ✗ OpenAPI spec not found at", openApiSource);
    return;
  }

  const spec = JSON.parse(await readFile(openApiSource, "utf-8")) as {
    info?: { version?: string };
    paths?: Record<string, Record<string, unknown>>;
    tags?: { name: string }[];
    components?: { schemas?: Record<string, unknown> };
  };
  const schemas = spec.components?.schemas ?? {};
  const apiVersion = resolveVersion("API_VERSION", "api");

  const tagMap: Record<string, string> = {
    V1Auth: "V1 Auth",
    V1Configuration: "V1 Configuration",
    V1Database: "V1 Database",
    V1Payments: "V1 Payments",
    V1Permissions: "V1 Permissions",
    V1Storage: "V1 Storage",
    V1Stripe: "V1 Stripe",
    V1TenantsLifecycle: "V1 Tenants",
    V1TenantsSubscriptions: "V1 Tenants",
    V1TenantsRoles: "V1 Tenants",
    V1TenantsUsers: "V1 Tenants",
    V1TenantsInvites: "V1 Tenants",
  };
  const tagOrder = [
    "V1 Auth",
    "V1 Configuration",
    "V1 Database",
    "V1 Payments",
    "V1 Permissions",
    "V1 Storage",
    "V1 Stripe",
    "V1 Tenants",
  ];

  const tagDescriptions: Record<string, string> = {
    Auth: "Sessions, identities, and tenant switching",
    Configuration: "Database migrations, email templates, and Stripe config",
    Database: "Migration status and database type generation",
    Payments: "Checkout, invoices, metered usage, and customer portals",
    Permissions: "Relationship-based access control checks",
    Storage: "File uploads, downloads, and object visibility",
    Stripe: "Products, prices, meters, and webhook configuration",
    Tenants: "Tenants, roles, subscriptions, and invitations",
  };

  const tagIcons: Record<string, string> = {
    Auth: "KeyRound",
    Configuration: "Settings",
    Database: "Database",
    Payments: "CreditCard",
    Permissions: "Shield",
    Storage: "HardDrive",
    Stripe: "Layers",
    Tenants: "Users",
  };

  const displayTag = (tag: string) =>
    tagMap[tag] ?? tag.replace(/^(V\d+)\s*(.+)$/i, "$1 $2");

  const tags = new Set<string>();
  for (const operations of Object.values(spec.paths ?? {})) {
    for (const operation of Object.values(operations)) {
      if (!Array.isArray(operation.tags)) continue;
      operation.tags = [...new Set(operation.tags.map(displayTag))];
      for (const tag of operation.tags) tags.add(tag);
    }
  }

  const tagIndex = (tag: string) => {
    const index = tagOrder.indexOf(tag);
    return index === -1 ? tagOrder.length : index;
  };
  spec.tags = [...tags]
    .sort((a, b) => tagIndex(a) - tagIndex(b) || a.localeCompare(b))
    .map((name) => ({ name }));

  const yaml = await import("yaml");
  await writeFile(openApiDest, yaml.stringify(spec));
  console.log("    ✓ Wrote apps/docs/openapi.yaml");

  const versionDir = join(openApiOutput, apiVersion);
  const stagingDir = join(openApiOutput, `.staging-${apiVersion}`);
  await rm(stagingDir, { recursive: true, force: true });
  await mkdir(stagingDir, { recursive: true });

  const tempOutput = join(ROOT, "node_modules/.cache/openapi-docs");
  await rm(tempOutput, { recursive: true, force: true });
  await mkdir(tempOutput, { recursive: true });

  // Generate MDX files using fumadocs-openapi programmatic API
  console.log("  → Generating API reference pages...");

  try {
    const { generateFiles } = await import("fumadocs-openapi");
    const { createOpenAPI } = await import("fumadocs-openapi/server");

    // Create an OpenAPI instance for the generator
    // Use the same schema ID as lib/openapi.ts
    const openapi = createOpenAPI({
      input: { "./openapi.yaml": spec },
    });

    await generateFiles({
      input: openapi,
      output: tempOutput,
      per: "operation",
      groupBy: "tag",
      includeDescription: true,
      addGeneratedComment: true,
    });
    console.log("    ✓ Generated OpenAPI docs");

    const { bundled } = await openapi.getSchema("./openapi.yaml");
    await writeFile(
      join(ROOT, "apps/docs/openapi.json"),
      JSON.stringify(bundled) + "\n"
    );

    // Generate meta.json files from OpenAPI tags
    console.log("  → Generating meta.json files from OpenAPI tags...");
    const tags = spec.tags || [];
    const tagEntries: {
      folderName: string;
      displayName: string;
      description: string;
      icon: string;
    }[] = [];
    const tagFolderByTag = new Map<string, string>();

    for (const tag of tags) {
      const tagName = tag.name as string;
      const displayName =
        (tag as { "x-displayName"?: string })["x-displayName"] ||
        tagName.replace(/^V\d+\s+/i, "");

      // Convert tag name to folder name (same format as fumadocs-openapi uses)
      const originalFolderName = tagName.toLowerCase().replace(/\s+/g, "-");
      const originalFolderPath = join(tempOutput, originalFolderName);

      // Only process if the folder exists (has endpoints)
      if (existsSync(originalFolderPath)) {
        // New folder name without version prefix (e.g., "auth" instead of "v1-auth")
        const newFolderName = displayName.toLowerCase().replace(/\s+/g, "-");
        const newFolderPath = join(stagingDir, newFolderName);

        if (originalFolderPath !== newFolderPath) {
          await rename(originalFolderPath, newFolderPath);
        }

        const description =
          tagDescriptions[displayName] ?? `${displayName} endpoints`;
        const icon = tagIcons[displayName] ?? "Box";
        tagFolderByTag.set(tagName, newFolderName);
        tagEntries.push({
          folderName: newFolderName,
          displayName,
          description,
          icon,
        });

        const operationEntries = (
          await readdir(newFolderPath, { withFileTypes: true })
        ).filter(
          (entry) =>
            entry.isFile() &&
            entry.name.endsWith(".mdx") &&
            entry.name !== "index.mdx"
        );
        const operations: { slug: string; title: string }[] = [];
        for (const entry of operationEntries) {
          const content = await readFile(
            join(newFolderPath, entry.name),
            "utf-8"
          );
          const title =
            content.match(/^title:\s*(.+)$/m)?.[1]?.trim().replace(/^"|"$/g, "") ??
            basename(entry.name, ".mdx");
          operations.push({
            slug: basename(entry.name, ".mdx"),
            title,
          });
        }
        operations.sort((a, b) => a.title.localeCompare(b.title));

        await writeFile(
          join(newFolderPath, "meta.json"),
          JSON.stringify(
            { title: capitalize(displayName), description },
            null,
            2
          )
        );
        await writeFile(
          join(newFolderPath, "index.mdx"),
          [
            "---",
            `title: ${JSON.stringify(capitalize(displayName))}`,
            `description: ${JSON.stringify(description)}`,
            "---",
            "",
            `## ${capitalize(displayName)} endpoints`,
            "",
            ...operations.map(
              (operation) => `- [${operation.title}](./${operation.slug})`
            ),
            "",
          ].join("\n")
        );
      }
    }

    const apiLlms: Record<string, string> = {};
    const methods = [
      "get",
      "put",
      "post",
      "delete",
      "patch",
      "options",
      "head",
      "trace",
    ];
    if (apiVersion !== "dev") {
      for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
        const pathParameters = Array.isArray(pathItem.parameters)
          ? (pathItem.parameters as OpenAPIParameter[])
          : [];

        for (const method of methods) {
          const operation = pathItem[method] as OpenAPIOperation | undefined;
          if (!operation?.operationId) continue;

          const tagName = operation.tags?.[0];
          const folderName = tagName ? tagFolderByTag.get(tagName) : undefined;
          if (!folderName) continue;

          const url = `/api/${apiVersion}/${folderName}/${operation.operationId}`;
          apiLlms[url] = renderOperationMarkdown(
            url,
            method,
            path,
            operation,
            schemas,
            pathParameters
          );
        }
      }
    }
    await rm(tempOutput, { recursive: true, force: true });

    const versionMeta = {
      title: apiVersion,
      root: "api",
      pages: ["index", ...tagEntries.map((entry) => entry.folderName)],
    };
    await writeFile(
      join(stagingDir, "meta.json"),
      JSON.stringify(versionMeta, null, 2)
    );

    const icons = [
      "KeyRound",
      "Settings",
      "Database",
      "CreditCard",
      "Shield",
      "HardDrive",
      "Layers",
      "Users",
      "Box",
    ];
    await writeFile(
      join(stagingDir, "index.mdx"),
      [
        "---",
        "title: API Reference",
        `description: HTTP API reference for version ${apiVersion}.`,
        "---",
        "",
        "import { Callout } from 'fumadocs-ui/components/callout';",
        "import { Card, Cards } from 'fumadocs-ui/components/card';",
        `import { ${icons.join(", ")} } from 'lucide-react';`,
        "",
        `<Callout type="info" title="Version ${apiVersion}">`,
        "This reference is generated from the OpenAPI spec. Endpoints and schemas on this page match this version.",
        "</Callout>",
        "",
        "## Base URL",
        "",
        "All endpoints are rooted at `/api/v1`.",
        "",
        "```bash",
        'curl "$OMNIBASE_URL/api/v1/tenants" \\',
        '  -H "Authorization: Bearer $OMNIBASE_TOKEN"',
        "```",
        "",
        "Authenticated requests use `Authorization: Bearer <token>`. Tenant-scoped requests can use the tenant JWT returned when a tenant is created.",
        "",
        "## Resources",
        "",
        "<Cards>",
        ...tagEntries.map(
          (entry) =>
            `  <Card href="./${entry.folderName}" title=${JSON.stringify(
              capitalize(entry.displayName)
            )} icon={<${entry.icon} />}>\n    ${entry.description}\n  </Card>`
        ),
        "</Cards>",
        "",
      ].join("\n")
    );

    await rm(versionDir, { recursive: true, force: true });
    await rename(stagingDir, versionDir);

    if (Object.keys(apiLlms).length > 0) {
      await writeFileAtomic(
        join(ROOT, "apps/docs/content/api-llms.json"),
        JSON.stringify(apiLlms, null, 2) + "\n"
      );
    }

    if (apiVersion !== "dev") {
      await rm(join(openApiOutput, "dev"), { recursive: true, force: true });
      await rm(join(openApiOutput, "0.0.0-dev"), {
        recursive: true,
        force: true,
      });
    }

    await collapseUnchangedVersion("api", apiVersion);

    const apiMeta = {
      title: "API",
      description: "REST API endpoints, schemas, and generated SDKs",
      icon: "Server",
      root: true,
      pages: ["index", "..."],
    };
    await writeFile(
      join(openApiOutput, "meta.json"),
      JSON.stringify(apiMeta, null, 2)
    );
    console.log("    ✓ Generated meta.json files");
  } catch (error) {
    await rm(stagingDir, { recursive: true, force: true });
    await rm(tempOutput, { recursive: true, force: true });
    console.error("    ✗ Failed to generate OpenAPI docs");
    console.error(error);
    throw error;
  }
}

function cmdShort(cmd: Command): string {
  return cmd.summary() || cmd.description()?.split("\n")[0] || "";
}

async function generateCommandDocPage(
  cmd: Command,
  parentDir: string,
  urlPrefix: string,
): Promise<void> {
  const isLeaf = cmd.commands.length === 0;
  const slug = cmd.name();
  const fullUrl = urlPrefix + "/" + slug;

  // Display name like "db migrate generate"
  const baseRe = /^\/cli\/[^/]+\/?/;
  const cmdPath = urlPrefix.replace(baseRe, "").replace(/^\//, "").replace(/\//g, " ");
  const displayName = cmdPath ? cmdPath + " " + slug : slug;

  const aliases = cmd.aliases();
  const rawArgs: any[] = (cmd as any)._args ?? [];

  const lines: string[] = [
    "---",
    `title: "${capitalize(slug)}"`,
    "---",
    "",
  ];

  if (cmd.summary()) {
    lines.push("## Summary", "", cmd.summary(), "");
  }

  lines.push("## Usage", "", "```bash", `omnibase ${displayName}`, "```", "");

  if (cmd.description()) {
    lines.push("## Description", "", cmd.description(), "");
  }

  if (aliases.length > 0) {
    lines.push(`**Aliases:** ${aliases.map((a) => `\`${a}\``).join(", ")}`, "");
  }

  if (rawArgs.length > 0) {
    lines.push("## Arguments", "");
    for (const arg of rawArgs) {
      const required = arg.required ? " (required)" : "";
      const argChoices: string[] = arg.argChoices ?? [];
      const choices =
        argChoices.length > 0
          ? ` (choices: ${argChoices.join(", ")})`
          : "";
      const defaultVal =
        arg.defaultValue !== undefined
          ? ` (default: \`${arg.defaultValue}\`)`
          : "";
      lines.push(`- \`${arg.name()}${required}${choices}${defaultVal}\``);
      if (arg.description) {
        lines.push(`  ${arg.description}`);
      }
    }
    lines.push("");
  }

  if (cmd.options.length > 0) {
    lines.push("## Options", "");
    for (const opt of cmd.options) {
      const mandatory = (opt as any).mandatory ? " (required)" : "";
      const defaultVal =
        opt.defaultValue !== undefined
          ? ` (default: \`${opt.defaultValue}\`)`
          : "";
      lines.push(`- **\`${opt.flags}\`**${mandatory}${defaultVal}`);
      if (opt.description) {
        lines.push(`  ${opt.description}`);
      }
    }
    lines.push("");
  }

  if (!isLeaf) {
    lines.push("## Subcommands", "", ...cmd.commands.map((sub) => {
      const subUrl = fullUrl + "/" + sub.name();
      const desc = cmdShort(sub);
      return `- [\`${sub.name()}\`](${subUrl})${desc ? ` — ${desc}` : ""}`;
    }), "");

    // Write as container: dir/index.md + meta.json
    const dir = join(parentDir, slug);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "index.md"), lines.join("\n"));
    await writeFile(
      join(dir, "meta.json"),
      JSON.stringify({
        title: capitalize(slug),
        pages: cmd.commands.map((c) => c.name()),
      }, null, 2),
    );

    for (const sub of cmd.commands) {
      await generateCommandDocPage(sub, dir, fullUrl);
    }
  } else {
    // Write as leaf file: slug.md
    await writeFile(join(parentDir, slug + ".md"), lines.join("\n"));
  }
}

async function generateCliCommandDocs(): Promise<void> {
  console.log("\n🔧 Generating CLI command documentation...\n");

  const version = resolveVersion("CLI_VERSION", "cli");
  const sectionDir = join(DOCS_CONTENT, "cli");
  const outputDir = join(sectionDir, version);
  const rootUrl = `/cli/${version}`;
  await cleanOutputDir(join("cli", version));

  const pages: string[] = [];

  await writeFile(
    join(outputDir, "index.md"),
    [
      "---",
      'title: "CLI Reference"',
      "---",
      "",
      "# OmniBase CLI",
      "",
      program.description(),
      "",
      "## Usage",
      "",
      `\`\`\`\n${program.name()} [command] [options]\n\`\`\``,
      "",
      ...(program.options.length > 0
        ? [
            "## Global Options",
            "",
            ...program.options.map((opt) => {
              const defaultVal =
                opt.defaultValue !== undefined
                  ? ` (default: \`${opt.defaultValue}\`)`
                  : "";
              return `- **\`${opt.flags}\`**${defaultVal} — ${opt.description || ""}`;
            }),
            "",
          ]
        : []),
      ...(program.commands.length > 0
        ? [
            "## Commands",
            "",
            ...program.commands.map((cmd) => {
              const cmdUrl = rootUrl + "/" + cmd.name();
              const desc = cmdShort(cmd);
              return `- [\`${cmd.name()}\`](${cmdUrl})${desc ? ` — ${desc}` : ""}`;
            }),
            "",
          ]
        : []),
    ].join("\n"),
  );

  for (const cmd of program.commands) {
    pages.push(cmd.name());
    await generateCommandDocPage(cmd, outputDir, rootUrl);
  }

  await writeFile(
    join(outputDir, "meta.json"),
    JSON.stringify(
      { title: version, root: "cli", pages: ["index", ...pages] },
      null,
      2
    ),
  );

  await collapseUnchangedVersion("cli", version);

  await writeFile(
    join(sectionDir, "meta.json"),
    JSON.stringify(
      {
        title: "CLI",
        description: "Command-line interface for projects and deployments",
        icon: "Terminal",
        root: true,
        pages: ["index", "..."],
      },
      null,
      2
    )
  );
  console.log("  ✓ Generated CLI command docs");
}

async function readVersionsManifest(): Promise<Record<string, string>> {
  const file = join(ROOT, "apps/docs/content/versions.json");
  if (!existsSync(file)) return {};
  return JSON.parse(await readFile(file, "utf-8")) as Record<string, string>;
}

async function writeVersionsManifest(): Promise<void> {
  const resolved = {
    api: resolveVersion("API_VERSION", "api"),
    cli: resolveVersion("CLI_VERSION", "cli"),
    nextjs: resolveVersion("NEXTJS_VERSION", "nextjs"),
    react: resolveVersion("REACT_VERSION", "react"),
    shadcn: resolveVersion("SHADCN_VERSION", "shadcn"),
  };
  const manifest = await readVersionsManifest();
  for (const [section, version] of Object.entries(resolved)) {
    if (version !== "dev") manifest[section] = version;
  }
  await writeFileAtomic(
    join(ROOT, "apps/docs/content/versions.json"),
    JSON.stringify(manifest, null, 2) + "\n"
  );
}

async function main(): Promise<void> {
  console.log("🚀 OmniBase Documentation Generator\n");
  console.log(`   Root: ${ROOT}`);
  console.log(`   Output: ${DOCS_CONTENT}`);

  const args = process.argv.slice(2);
  const typedocOnly = args.includes("--typedoc");
  const openapiOnly = args.includes("--openapi");
  const cliCommandsOnly = args.includes("--cli-commands");
  const all = !typedocOnly && !openapiOnly && !cliCommandsOnly;

  try {
    if (all || typedocOnly) {
      await generateTypeDocs();
    }

    if (all || openapiOnly) {
      await generateOpenAPIDocs();
    }

    if (all || cliCommandsOnly) {
      await generateCliCommandDocs();
    }

    await writeVersionsManifest();

    console.log("\n📝 Generating changelog pages...\n");
    await generateChangelogs(ROOT);

    console.log("\n✅ Documentation generation complete!\n");
  } catch (error) {
    console.error("\n❌ Documentation generation failed!\n");
    console.error(error);
    process.exit(1);
  }
}

main();
