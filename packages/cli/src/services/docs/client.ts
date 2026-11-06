import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const DEFAULT_DOCS_URL = "https://docs.omnibase.tech";
const CACHE_TTL_MS = 60 * 60 * 1000;

export interface DocPage {
  title: string;
  url: string;
  path: string;
  description?: string;
  content: string;
}

export interface DocSummary {
  title: string;
  url: string;
  path: string;
  description?: string;
}

export interface DocSearchResult extends DocSummary {
  snippet: string;
  score: number;
}

function docsBaseUrl(): string {
  return (process.env.OMNIBASE_DOCS_URL ?? DEFAULT_DOCS_URL).replace(
    /\/+$/,
    "",
  );
}

function cachePath(baseUrl: string): string {
  const cacheRoot = process.env.XDG_CACHE_HOME ?? join(homedir(), ".cache");
  const key = createHash("sha1").update(baseUrl).digest("hex").slice(0, 12);
  return join(cacheRoot, "omnibase", `docs-${key}.json`);
}

function normalizePath(input: string): string {
  return input
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\/+/, "")
    .replace(/^llms\.mdx\//, "")
    .replace(/\.md$/, "")
    .replace(/\/+$/, "");
}

export class DocsService {
  constructor(private readonly baseUrl = docsBaseUrl()) {}

  async list(refresh = false): Promise<DocSummary[]> {
    return (await this.load(refresh)).map(
      ({ title, url, path, description }) => ({
        title,
        url,
        path,
        description,
      }),
    );
  }

  async search(
    query: string,
    limit = 5,
    refresh = false,
  ): Promise<DocSearchResult[]> {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];

    return (await this.load(refresh))
      .map((page) => {
        const title = page.title.toLowerCase();
        const content = page.content.toLowerCase();
        let score = 0;

        for (const term of terms) {
          score += (title.split(term).length - 1) * 3;
          score += content.split(term).length - 1;
        }

        let snippet = "";
        if (score > 0) {
          const index = content.indexOf(terms[0]);
          if (index >= 0) {
            const start = Math.max(0, index - 80);
            const end = Math.min(page.content.length, index + 240);
            snippet =
              (start > 0 ? "..." : "") +
              page.content.slice(start, end).trim() +
              (end < page.content.length ? "..." : "");
          } else {
            snippet = page.content.slice(0, 240).trim();
          }
        }

        return {
          title: page.title,
          url: page.url,
          path: page.path,
          description: page.description,
          snippet,
          score,
        };
      })
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async get(path: string, refresh = false): Promise<DocPage> {
    const pages = await this.load(refresh);
    const normalized = normalizePath(path);
    const exact = pages.find(
      (entry) =>
        entry.path === normalized ||
        normalizePath(entry.url) === normalized,
    );
    if (exact) return exact;

    const segments = normalized.split('/');
    if (segments[1] === 'latest') {
      const section = segments[0];
      const candidate = pages.find((entry) =>
        entry.path.startsWith(`${section}/`),
      );
      if (candidate) {
        const version = candidate.path.split('/')[1];
        const resolved = [section, version, ...segments.slice(2)].join('/');
        const page = pages.find((entry) => entry.path === resolved);
        if (page) return page;
      }
    }

    throw new Error(`Documentation page not found: ${path}`);
  }

  private async load(refresh: boolean): Promise<DocPage[]> {
    if (!refresh) {
      const cached = await this.readCache();
      if (cached) return cached;
    }

    const response = await fetch(`${this.baseUrl}/llms.json`, {
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch docs: ${response.status} ${response.statusText}`,
      );
    }

    const pages = (await response.json()) as DocPage[];
    await this.writeCache(pages);
    return pages;
  }

  private async readCache(): Promise<DocPage[] | null> {
    try {
      const file = cachePath(this.baseUrl);
      const info = await stat(file);
      if (Date.now() - info.mtimeMs > CACHE_TTL_MS) return null;
      return JSON.parse(await readFile(file, "utf8")) as DocPage[];
    } catch {
      return null;
    }
  }

  private async writeCache(pages: DocPage[]): Promise<void> {
    try {
      const file = cachePath(this.baseUrl);
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, JSON.stringify(pages));
    } catch {
      return;
    }
  }
}
