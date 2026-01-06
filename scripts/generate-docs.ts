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

const ROOT = dirname(dirname(import.meta.path));
const DOCS_CONTENT = join(ROOT, "apps/docs/content/docs");

interface TypeDocTarget {
  name: string;
  packagePath: string;
  entryPoints: string[];
  outputDir: string;
}

const TYPEDOC_TARGETS: TypeDocTarget[] = [
  {
    name: "@omnibase/nextjs",
    packagePath: "sdk/framework/nextjs",
    entryPoints: ["src/auth/index.ts", "src/middleware/index.ts"],
    outputDir: "reference/sdk/nextjs",
  },
  {
    name: "@omnibase/react",
    packagePath: "sdk/framework/react",
    entryPoints: ["src/index.ts"],
    outputDir: "reference/sdk/react",
  },
  {
    name: "@omnibase/shadcn",
    packagePath: "sdk/component/shadcn",
    entryPoints: ["src/index.ts"],
    outputDir: "reference/sdk/shadcn",
  },
  {
    name: "@omnibase/cli",
    packagePath: "packages/cli",
    entryPoints: ["src/index.ts"],
    outputDir: "reference/cli",
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

async function generateTypeDocs(): Promise<void> {
  console.log("\n📚 Generating TypeDoc documentation...\n");

  for (const target of TYPEDOC_TARGETS) {
    console.log(`  → ${target.name}`);

    const packageDir = join(ROOT, target.packagePath);
    const outputPath = join(DOCS_CONTENT, target.outputDir);
    const tsconfigPath = join(packageDir, "tsconfig.json");

    // Clean and create output directory
    await cleanOutputDir(target.outputDir);

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
      console.log(`    ✓ Generated docs for ${target.name}`);
    } catch (error) {
      console.error(`    ✗ Failed to generate docs for ${target.name}`);
      console.error(error);
    }
  }
}

async function generateOpenAPIDocs(): Promise<void> {
  console.log("\n📖 Generating OpenAPI documentation...\n");

  const openApiSource = join(ROOT, "apps/api/docs/openapi.yaml");
  const openApiDest = join(ROOT, "apps/docs/openapi.yaml");
  const openApiOutput = join(DOCS_CONTENT, "reference/api");

  // Run existing bundle-openapi.sh script
  console.log("  → Bundling OpenAPI spec (using bundle-openapi.sh)...");
  await run(["./scripts/bundle-openapi.sh"]);

  if (!existsSync(openApiSource)) {
    console.error("  ✗ OpenAPI spec not found at", openApiSource);
    return;
  }

  // Copy openapi.yaml to docs directory (for fumadocs-openapi runtime access)
  console.log("  → Copying OpenAPI spec to docs directory...");
  const openApiContent = await readFile(openApiSource, "utf-8");
  await writeFile(openApiDest, openApiContent);
  console.log("    ✓ Copied openapi.yaml to apps/docs/");

  // Clean and create output directory
  await cleanOutputDir("reference/api");

  // Generate MDX files using fumadocs-openapi programmatic API
  console.log("  → Generating API reference pages...");

  try {
    const { generateFiles } = await import("fumadocs-openapi");
    const { createOpenAPI } = await import("fumadocs-openapi/server");
    const yaml = await import("yaml");

    // Load the OpenAPI spec
    const specContent = await readFile(openApiDest, "utf-8");
    const spec = yaml.parse(specContent);

    // Create an OpenAPI instance for the generator
    // Use function-based input to set the schema ID to match lib/openapi.ts
    const openapi = createOpenAPI({
      input: () => ({
        "./openapi.yaml": spec,
      }),
    });

    await generateFiles({
      input: openapi,
      output: openApiOutput,
      per: "operation",
      groupBy: "tag",
      includeDescription: true,
      addGeneratedComment: true,
    });
    console.log("    ✓ Generated OpenAPI docs");

    // Generate meta.json files from OpenAPI tags, grouped by version
    console.log("  → Generating meta.json files from OpenAPI tags...");
    const tags = spec.tags || [];

    // Group tags by version (e.g., "V1 Auth" -> { version: "v1", name: "Auth" })
    const versionGroups: Record<
      string,
      { folderName: string; displayName: string }[]
    > = {};

    for (const tag of tags) {
      const tagName = tag.name as string;
      // Parse version from tag name (e.g., "V1 Auth" -> version: "v1", name: "Auth")
      const versionMatch = tagName.match(/^(V\d+)\s+(.+)$/i);

      let version = "v1"; // Default version if no prefix
      let displayName =
        (tag as { "x-displayName"?: string })["x-displayName"] || tagName;

      if (versionMatch) {
        version = versionMatch[1]!.toLowerCase();
        displayName =
          (tag as { "x-displayName"?: string })["x-displayName"] ||
          versionMatch[2]!;
      }

      // Convert tag name to folder name (same format as fumadocs-openapi uses)
      const originalFolderName = tagName.toLowerCase().replace(/\s+/g, "-");
      const originalFolderPath = join(openApiOutput, originalFolderName);

      // Only process if the folder exists (has endpoints)
      if (existsSync(originalFolderPath)) {
        if (!versionGroups[version]) {
          versionGroups[version] = [];
        }

        // New folder name without version prefix (e.g., "auth" instead of "v1-auth")
        const newFolderName = displayName.toLowerCase().replace(/\s+/g, "-");
        versionGroups[version]!.push({ folderName: newFolderName, displayName });

        // Move folder to version subdirectory
        const versionDir = join(openApiOutput, version);
        const newFolderPath = join(versionDir, newFolderName);

        await mkdir(versionDir, { recursive: true });

        // Rename/move the folder
        if (originalFolderPath !== newFolderPath) {
          await rename(originalFolderPath, newFolderPath);
        }

        // Create meta.json for the tag folder
        const tagMeta = { title: capitalize(displayName) };
        await writeFile(
          join(newFolderPath, "meta.json"),
          JSON.stringify(tagMeta, null, 2)
        );
      }
    }

    // Create meta.json for each version folder
    const versionFolders: string[] = [];
    for (const [version, tagInfos] of Object.entries(versionGroups).sort()) {
      versionFolders.push(version);
      const versionMeta = {
        title: version.toUpperCase(),
        pages: tagInfos.map((t) => t.folderName),
      };
      await writeFile(
        join(openApiOutput, version, "meta.json"),
        JSON.stringify(versionMeta, null, 2)
      );
    }

    // Create main API meta.json with version folders
    const apiMeta = {
      title: "API",
      pages: versionFolders,
    };
    await writeFile(
      join(openApiOutput, "meta.json"),
      JSON.stringify(apiMeta, null, 2)
    );
    console.log("    ✓ Generated meta.json files");
  } catch (error) {
    console.error("    ✗ Failed to generate OpenAPI docs");
    console.error(error);
  }
}

async function createMetaFiles(): Promise<void> {
  console.log("\n📁 Creating meta.json files...\n");

  // Only create meta files for generated subdirectories
  // Don't overwrite root-level meta.json (reference/meta.json) as it may have custom config
  const metaConfigs = [
    {
      path: join(DOCS_CONTENT, "reference/sdk/meta.json"),
      content: {
        title: "SDKs",
        pages: ["nextjs", "react", "shadcn"],
      },
    },
    {
      path: join(DOCS_CONTENT, "reference/api/meta.json"),
      content: {
        title: "API Reference",
      },
    },
    {
      path: join(DOCS_CONTENT, "reference/cli/meta.json"),
      content: {
        title: "CLI",
      },
    },
  ];

  for (const { path, content } of metaConfigs) {
    const dir = dirname(path);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    // Only create if doesn't exist (don't overwrite user customizations)
    if (!existsSync(path)) {
      await Bun.write(path, JSON.stringify(content, null, 2));
      console.log(`  ✓ Created ${path.replace(ROOT, "")}`);
    } else {
      console.log(`  → Skipped ${path.replace(ROOT, "")} (already exists)`);
    }
  }
}

async function main(): Promise<void> {
  console.log("🚀 OmniBase Documentation Generator\n");
  console.log(`   Root: ${ROOT}`);
  console.log(`   Output: ${DOCS_CONTENT}`);

  const args = process.argv.slice(2);
  const typedocOnly = args.includes("--typedoc");
  const openapiOnly = args.includes("--openapi");
  const all = !typedocOnly && !openapiOnly;

  try {
    if (all || typedocOnly) {
      await generateTypeDocs();
    }

    if (all || openapiOnly) {
      await generateOpenAPIDocs();
    }

    await createMetaFiles();

    console.log("\n✅ Documentation generation complete!\n");
  } catch (error) {
    console.error("\n❌ Documentation generation failed!\n");
    console.error(error);
    process.exit(1);
  }
}

main();
