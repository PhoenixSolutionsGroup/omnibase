#!/usr/bin/env bun
import { existsSync } from "fs";
import { readFile, rm, writeFile } from "fs/promises";
import { dirname, join } from "path";

const REPO_URL = "https://github.com/PhoenixSolutionsGroup/omnibase";

export interface ChangelogPackage {
  id: string;
  title: string;
  changelog: string;
  tagPrefix: string;
  section?: string;
}

export const CHANGELOG_PACKAGES: ChangelogPackage[] = [
  { id: "api", title: "API", changelog: "apps/api/CHANGELOG.md", tagPrefix: "api", section: "api" },
  { id: "cli", title: "CLI", changelog: "packages/cli/CHANGELOG.md", tagPrefix: "cli", section: "cli" },
  { id: "nextjs", title: "Next.js", changelog: "sdk/framework/nextjs/CHANGELOG.md", tagPrefix: "nextjs", section: "nextjs" },
  { id: "react", title: "React", changelog: "sdk/framework/react/CHANGELOG.md", tagPrefix: "react", section: "react" },
  { id: "shadcn", title: "Shadcn", changelog: "sdk/component/shadcn/CHANGELOG.md", tagPrefix: "shadcn", section: "shadcn" },
  { id: "auth", title: "Auth", changelog: "docker/auth/CHANGELOG.md", tagPrefix: "auth" },
  { id: "permissions", title: "Permissions", changelog: "docker/permissions/CHANGELOG.md", tagPrefix: "permissions" },
];

export interface Release {
  version: string;
  date?: string;
  compareUrl?: string;
  body: string;
}

const LINKED_HEADING = /^#{1,2} \[(\d+\.\d+\.\d+)\]\(([^)]+)\)(?: \((\d{4}-\d{2}-\d{2})\))?\s*$/;
const PLAIN_HEADING = /^#{1,2} (\d+\.\d+\.\d+)(?: \((\d{4}-\d{2}-\d{2})\))?\s*$/;
const OTHER_HEADING = /^#{1,2} /;

export function parseChangelog(markdown: string): Release[] {
  const releases: Release[] = [];
  let current: { release: Release; lines: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    current.release.body = current.lines.join("\n").trim();
    releases.push(current.release);
    current = null;
  };

  for (const line of markdown.split("\n")) {
    const linked = LINKED_HEADING.exec(line);
    const plain = linked ? null : PLAIN_HEADING.exec(line);
    if (linked || plain) {
      flush();
      current = {
        release: linked
          ? { version: linked[1], compareUrl: linked[2], date: linked[3], body: "" }
          : { version: plain![1], date: plain![2], body: "" },
        lines: [],
      };
      continue;
    }
    if (OTHER_HEADING.test(line)) {
      flush();
      continue;
    }
    current?.lines.push(line);
  }
  flush();

  const seen = new Set<string>();
  return releases.filter((release) => {
    const key = `${release.version} ${release.compareUrl ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const COMMIT_LINK = /\s*\(\[([0-9a-f]{7,40})\]\((https:\/\/github\.com\/[^)]+\/commit\/[0-9a-f]+)\)\)/g;
const SKIP_CI = /\s*\[skip ci\]/gi;
const SYNC_ENTRY = /^\* (?:\*\*cli:\*\* )?sync \w+ docker image to /;

function escapeMdx(text: string): string {
  return text
    .split(/(`[^`]*`)/)
    .map((part, i) =>
      i % 2 === 1 ? part : part.replace(/[{}<>]/g, (c) => `\\${c}`),
    )
    .join("");
}

export function cleanBody(body: string): string {
  const out: string[] = [];
  let skippingEntry = false;

  for (const raw of body.split("\n")) {
    if (SYNC_ENTRY.test(raw)) {
      skippingEntry = true;
      continue;
    }
    if (skippingEntry && raw.startsWith("  ")) continue;
    skippingEntry = false;

    const heading = /^#{3,} (.+)$/.exec(raw);
    if (heading) {
      out.push(`**${heading[1].trim()}**`);
      continue;
    }

    const line = raw
      .replace(SKIP_CI, "")
      .replace(COMMIT_LINK, (_m, sha: string, url: string) => ` [${sha.slice(0, 7)}](${url})`);
    out.push(escapeMdx(line.trimEnd()));
  }

  const blocks = out
    .join("\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const kept = blocks.filter((block, i) => {
    const isLabel = /^\*\*[^*]+\*\*$/.test(block);
    if (!isLabel) return true;
    const next = blocks[i + 1];
    return next !== undefined && !/^\*\*[^*]+\*\*$/.test(next);
  });

  return kept.join("\n\n");
}

export function releaseUrl(pkg: ChangelogPackage, release: Release): string {
  const tag = release.compareUrl
    ? release.compareUrl.split("...").at(-1)!
    : release.date
      ? `${pkg.tagPrefix}-v${release.version}`
      : null;
  if (!tag) return `${REPO_URL}/blob/main/${pkg.changelog}`;
  return `${REPO_URL}/releases/tag/${encodeURIComponent(tag)}`;
}

export type DocsExist = (section: string, version: string) => boolean;

export function versionUrl(
  pkg: ChangelogPackage,
  release: Release,
  docsExist: DocsExist,
): string {
  if (pkg.section && docsExist(pkg.section, release.version)) {
    return `/${pkg.section}/${release.version}`;
  }
  return releaseUrl(pkg, release);
}

function releaseMeta(url: string, release: Release): string {
  const parts = [url.startsWith("/") ? `[Docs](${url})` : `[GitHub release](${url})`];
  if (release.date) parts.push(release.date);
  if (release.compareUrl) parts.push(`[Compare changes](${release.compareUrl})`);
  return parts.join(" · ");
}

function renderRelease(heading: string, url: string, release: Release): string[] {
  return [
    heading,
    "",
    releaseMeta(url, release),
    "",
    cleanBody(release.body) || "No user-facing changes.",
    "",
  ];
}

export function renderSectionPage(
  pkg: ChangelogPackage,
  latest: string,
  releases: Release[],
  docsExist: DocsExist,
): string {
  const docsUrl = `/${pkg.section}/${latest}`;
  return [
    "---",
    `title: ${pkg.title} Changelog`,
    `description: "Latest: v${latest}. Release notes for every ${pkg.title} version, newest first."`,
    "---",
    "",
    `**Latest: v${latest}**`,
    "",
    "<Cards>",
    `  <Card title="Read the ${pkg.title} v${latest} docs" href="${docsUrl}" />`,
    "</Cards>",
    "",
    `All ${pkg.title} releases are listed below, newest first. Each version links to its docs, or to its GitHub release when the docs for that version are no longer published. See the [changelog for every package](/changelog).`,
    "",
    ...releases.flatMap((release) =>
      renderRelease(`## v${release.version}`, versionUrl(pkg, release, docsExist), release),
    ),
  ].join("\n");
}

export interface CombinedEntry {
  pkg: ChangelogPackage;
  release: Release;
}

export function sortCombined(entries: CombinedEntry[]): CombinedEntry[] {
  const order = new Map(CHANGELOG_PACKAGES.map((p, i) => [p.id, i]));
  return [...entries].sort((a, b) => {
    const byDate = (b.release.date ?? "").localeCompare(a.release.date ?? "");
    if (byDate !== 0) return byDate;
    return (order.get(a.pkg.id) ?? 0) - (order.get(b.pkg.id) ?? 0);
  });
}

export function renderCombinedPage(
  entries: CombinedEntry[],
  docsExist: DocsExist,
): string {
  const packages = CHANGELOG_PACKAGES.map(({ id, title }) => ({ id, title }));
  return [
    "---",
    "title: Changelog",
    "description: Release notes for every OmniBase package and service, newest first.",
    "---",
    "",
    "Every release of the API, CLI, SDKs, and the auth and permissions services, newest first. Pin service versions with `[versions]` in `omnibase.toml`.",
    "",
    `<ChangelogFilter packages={${JSON.stringify(packages)}}>`,
    "",
    ...sortCombined(entries).flatMap(({ pkg, release }) => [
      `<ChangelogEntry package="${pkg.id}">`,
      "",
      ...renderRelease(
        `## ${pkg.title} v${release.version}`,
        versionUrl(pkg, release, docsExist),
        release,
      ),
      "</ChangelogEntry>",
      "",
    ]),
    "</ChangelogFilter>",
    "",
  ].join("\n");
}

export async function generateChangelogs(root: string): Promise<void> {
  const docsContent = join(root, "apps/docs/content/docs");
  const versions = JSON.parse(
    await readFile(join(root, "apps/docs/content/versions.json"), "utf-8"),
  ) as Record<string, string>;
  const aliasesPath = join(root, "apps/docs/content/version-aliases.json");
  const aliases = existsSync(aliasesPath)
    ? (JSON.parse(await readFile(aliasesPath, "utf-8")) as Record<string, Record<string, string>>)
    : {};

  const docsExist: DocsExist = (section, version) =>
    existsSync(join(docsContent, section, version)) ||
    Boolean(aliases[section]?.[version]);

  const combined: CombinedEntry[] = [];

  for (const pkg of CHANGELOG_PACKAGES) {
    const file = join(root, pkg.changelog);
    if (!existsSync(file)) continue;
    const releases = parseChangelog(await readFile(file, "utf-8"));
    combined.push(...releases.map((release) => ({ pkg, release })));

    if (!pkg.section) continue;
    const latest = versions[pkg.section] ?? releases[0]?.version;
    if (!latest) continue;

    const sectionDir = join(docsContent, pkg.section);
    await rm(join(sectionDir, "index.md"), { force: true });
    await writeFile(
      join(sectionDir, "index.mdx"),
      renderSectionPage(pkg, latest, releases, docsExist),
    );
  }

  await writeFile(
    join(docsContent, "changelog.mdx"),
    renderCombinedPage(combined, docsExist),
  );
  console.log("  ✓ Generated changelog pages");
}

if (import.meta.main) {
  await generateChangelogs(dirname(dirname(import.meta.path)));
}
