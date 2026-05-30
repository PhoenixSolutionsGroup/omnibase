#!/usr/bin/env node

import { FastMCP } from "fastmcp";
import { z } from "zod";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = resolve(__dirname, "..", "docs");
const PKG = JSON.parse(
  readFileSync(resolve(__dirname, "..", "package.json"), "utf-8")
);

interface DocEntry {
  path: string;
  title: string;
  content: string;
}

function parseFrontmatter(raw: string): {
  attributes: Record<string, string>;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { attributes: {}, body: raw };
  const attrs: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      attrs[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return { attributes: attrs, body: match[2] };
}

function collectFiles(dir: string, base: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full, base));
    } else if ([".md", ".mdx"].includes(extname(entry.name))) {
      results.push(relative(base, full));
    }
  }
  return results;
}

function loadDocs(): DocEntry[] {
  return collectFiles(DOCS_DIR, DOCS_DIR).map((filePath) => {
    const raw = readFileSync(resolve(DOCS_DIR, filePath), "utf-8");
    const { attributes, body } = parseFrontmatter(raw);
    return {
      path: filePath,
      title: attributes.title || filePath,
      content: body,
    };
  });
}

function searchDocs(
  docs: DocEntry[],
  query: string,
  limit: number
): { path: string; title: string; snippet: string; score: number }[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return docs
    .map((doc) => {
      const titleLower = doc.title.toLowerCase();
      const contentLower = doc.content.toLowerCase();
      let score = 0;

      for (const term of terms) {
        score += (titleLower.split(term).length - 1) * 3;
        score += contentLower.split(term).length - 1;
      }

      let snippet = "";
      if (score > 0) {
        const idx = contentLower.indexOf(terms[0]);
        if (idx >= 0) {
          const start = Math.max(0, idx - 50);
          const end = Math.min(doc.content.length, idx + 200);
          snippet =
            (start > 0 ? "..." : "") +
            doc.content.slice(start, end).trim() +
            (end < doc.content.length ? "..." : "");
        } else {
          snippet =
            doc.content.slice(0, 200).trim() +
            (doc.content.length > 200 ? "..." : "");
        }
      }

      return { path: doc.path, title: doc.title, snippet, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

let versionWarning: string | null = null;

async function checkVersion(): Promise<void> {
  try {
    const res = await fetch(
      "https://registry.npmjs.org/@omnibase/mcp-server/latest",
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) return;
    const data = (await res.json()) as { version?: string };
    if (data.version && data.version !== PKG.version) {
      versionWarning = `⚠️ Update available: ${PKG.version} → ${data.version}. Run \`npm install -g @omnibase/mcp-server@latest\` to update.`;
    }
  } catch {
    // fail silently on network errors
  }
}

function consumeWarning(): string {
  if (!versionWarning) return "";
  const warning = versionWarning + "\n\n";
  versionWarning = null;
  return warning;
}

const docs = loadDocs();
checkVersion();

const server = new FastMCP({
  name: "omnibase-docs",
  version: PKG.version,
});

server.addTool({
  name: "omnibase_list_docs",
  description:
    "List all available Omnibase documentation pages with their path and title.",
  parameters: z.object({}),
  execute: async () => {
    const list = docs.map((d) => ({ path: d.path, title: d.title }));
    return consumeWarning() + JSON.stringify(list, null, 2);
  },
});

server.addTool({
  name: "omnibase_search_docs",
  description:
    "Search across all Omnibase documentation by keyword. Returns ranked results with path, title, and snippet.",
  parameters: z.object({
    query: z.string().describe("Search query string"),
    limit: z
      .number()
      .default(5)
      .describe("Maximum number of results to return"),
  }),
  execute: async (args) => {
    const results = searchDocs(docs, args.query, args.limit);
    return consumeWarning() + JSON.stringify(results, null, 2);
  },
});

server.addTool({
  name: "omnibase_get_doc",
  description:
    "Get the full content of a documentation page by its file path (as returned by search or list). Returns the document with frontmatter stripped.",
  parameters: z.object({
    path: z
      .string()
      .describe(
        "File path of the document (e.g. 'getting-started.mdx')"
      ),
  }),
  execute: async (args) => {
    const doc = docs.find((d) => d.path === args.path);
    if (!doc) return consumeWarning() + `Document not found: ${args.path}`;
    return consumeWarning() + doc.content;
  },
});

server.start({ transportType: "stdio" });
