#!/usr/bin/env bun

import { readFileSync, writeFileSync, readdirSync, unlinkSync, renameSync, statSync } from "node:fs";
import { resolve, extname, join } from "node:path";

const DOCS_DIR = resolve(import.meta.dirname, "..", "docs");

function collectFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full));
    } else if ([".md", ".mdx"].includes(extname(entry.name))) {
      results.push(full);
    }
  }
  return results;
}

function isInsideCodeBlock(lines: string[], lineIndex: number): boolean {
  let fenceCount = 0;
  for (let i = 0; i < lineIndex; i++) {
    if (lines[i].trimStart().startsWith("```")) fenceCount++;
  }
  return fenceCount % 2 === 1;
}

function convert(content: string): string {
  const lines = content.split("\n");
  const output: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (isInsideCodeBlock(lines, i)) {
      output.push(line);
      continue;
    }

    if (/^import\s+.*from\s+['"]fumadocs/.test(trimmed)) continue;
    if (/^import\s+.*from\s+['"]lucide-react/.test(trimmed)) continue;

    if (/^<APIPage\s/.test(trimmed)) continue;

    if (/^<\/?(Steps|Cards|Accordions|Files)\s*>$/.test(trimmed)) continue;

    if (/^<Step\s*>$/.test(trimmed) || /^<\/Step>$/.test(trimmed)) continue;

    if (/^<Callout[^>]*>$/.test(trimmed)) {
      output.push("> **Note:**");
      continue;
    }
    if (/^<\/Callout>$/.test(trimmed)) {
      output.push("");
      continue;
    }

    if (/^<Accordion\s+title="([^"]*)"/.test(trimmed)) {
      const title = trimmed.match(/title="([^"]*)"/)?.[1] ?? "";
      output.push(`#### ${title}`);
      output.push("");
      continue;
    }
    if (/^<\/Accordion>$/.test(trimmed)) continue;

    if (/^<Card\s/.test(trimmed)) {
      const title = trimmed.match(/title="([^"]*)"/)?.[1];
      const href = trimmed.match(/href="([^"]*)"/)?.[1];
      if (title && trimmed.endsWith("/>")) {
        output.push(href ? `- **[${title}](${href})**` : `- **${title}**`);
      } else if (title) {
        output.push(href ? `- **[${title}](${href})**` : `- **${title}**`);
      }
      continue;
    }
    if (/^<\/Card>$/.test(trimmed)) continue;

    if (/^<Tabs\s/.test(trimmed) || /^<\/Tabs>$/.test(trimmed)) continue;

    if (/^<Tab\s+value="([^"]*)"/.test(trimmed)) {
      const value = trimmed.match(/value="([^"]*)"/)?.[1] ?? "";
      output.push(`**${value}:**`);
      output.push("");
      continue;
    }
    if (/^<\/Tab>$/.test(trimmed)) continue;

    if (/^<File\s+name="([^"]*)"/.test(trimmed)) {
      const name = trimmed.match(/name="([^"]*)"/)?.[1] ?? "";
      output.push(`- \`${name}\``);
      continue;
    }
    if (/^<Folder\s+name="([^"]*)"/.test(trimmed)) {
      const name = trimmed.match(/name="([^"]*)"/)?.[1] ?? "";
      output.push(`- \`${name}/\``);
      continue;
    }
    if (/^<\/?(File|Folder)\s*\/?>$/.test(trimmed)) continue;

    output.push(line);
  }

  let result = output.join("\n");
  result = result.replace(/\n{3,}/g, "\n\n");
  result = result.replace(/\n+$/, "\n");

  return result;
}

const files = collectFiles(DOCS_DIR);
let converted = 0;

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  const cleaned = convert(content);
  writeFileSync(file, cleaned, "utf-8");

  if (file.endsWith(".mdx")) {
    const newPath = file.replace(/\.mdx$/, ".md");
    renameSync(file, newPath);
  }

  converted++;
}

console.log(`Converted ${converted} files.`);
