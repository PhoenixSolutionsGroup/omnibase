export const VERSION_REPOS: Record<string, string> = {
  auth: "phoenixsolutionsgroup/omnibase-auth",
  api: "phoenixsolutionsgroup/omnibase-api",
  perm: "phoenixsolutionsgroup/omnibase-permissions",
};

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

export function latestSemverTag(tags: string[]): string | null {
  let best: number[] | null = null;
  let bestTag: string | null = null;
  for (const tag of tags) {
    const match = SEMVER.exec(tag);
    if (!match) continue;
    const parts = match.slice(1).map(Number);
    if (!best || compare(parts, best) > 0) {
      best = parts;
      bestTag = tag;
    }
  }
  return bestTag;
}

function compare(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

export async function fetchLatestVersions(
  fetchFn: FetchFn = fetch,
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    Object.entries(VERSION_REPOS).map(async ([svc, repo]) => {
      try {
        const res = await fetchFn(
          `https://hub.docker.com/v2/repositories/${repo}/tags?page_size=100&ordering=last_updated`,
          { signal: AbortSignal.timeout(10_000) },
        );
        if (!res.ok) return null;
        const body = (await res.json()) as { results?: { name: string }[] };
        const tag = latestSemverTag((body.results ?? []).map((r) => r.name));
        return tag ? ([svc, tag] as const) : null;
      } catch {
        return null;
      }
    }),
  );
  return Object.fromEntries(entries.filter((e) => e !== null));
}

export function pinVersionsInToml(
  toml: string,
  versions: Record<string, string>,
): string {
  const keys = Object.keys(VERSION_REPOS).filter((k) => versions[k]);
  if (keys.length === 0) return toml;

  const block = /^# \[versions\]\n(?:# \w+ = "[^"]*"\n?)*/m;
  if (!block.test(toml)) return toml;

  const pinned = [
    "[versions]",
    ...keys.map((k) => `${k} = "${versions[k]}"`),
  ].join("\n");
  return toml.replace(block, (match) =>
    match.endsWith("\n") ? `${pinned}\n` : pinned,
  );
}
