import { test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  fetchLatestVersions,
  latestSemverTag,
  pinVersionsInToml,
} from "./versions";

const template = readFileSync(
  join(__dirname, "..", "..", "templates", "omnibase.toml"),
  "utf-8",
);

test("latestSemverTag picks the highest numeric version and ignores other tags", () => {
  expect(latestSemverTag(["latest", "0.9.0", "0.10.0", "0.10.0-rc.1", "0.2.11"])).toBe("0.10.0");
});

test("latestSemverTag returns null without semver tags", () => {
  expect(latestSemverTag(["latest", "main"])).toBeNull();
});

test("fetchLatestVersions resolves each service from Docker Hub tags", async () => {
  const tags: Record<string, string[]> = {
    "omnibase-auth": ["latest", "0.4.4", "0.5.0"],
    "omnibase-api": ["0.21.0", "latest"],
    "omnibase-permissions": ["0.4.0"],
  };
  const fakeFetch = async (url: string) => {
    const repo = url.split("/repositories/phoenixsolutionsgroup/")[1].split("/")[0];
    return new Response(
      JSON.stringify({ results: tags[repo].map((name) => ({ name })) }),
    );
  };

  expect(await fetchLatestVersions(fakeFetch)).toEqual({
    auth: "0.5.0",
    api: "0.21.0",
    perm: "0.4.0",
  });
});

test("fetchLatestVersions omits services that fail to resolve", async () => {
  const fakeFetch = async (url: string) => {
    if (url.includes("omnibase-api")) throw new Error("offline");
    if (url.includes("omnibase-auth")) return new Response("", { status: 500 });
    return new Response(JSON.stringify({ results: [{ name: "0.4.0" }] }));
  };

  expect(await fetchLatestVersions(fakeFetch)).toEqual({ perm: "0.4.0" });
});

test("pinVersionsInToml uncomments the template [versions] block with the given tags", () => {
  const out = pinVersionsInToml(template, { auth: "0.5.0", api: "0.21.0", perm: "0.4.0" });

  expect(out).toContain('[versions]\nauth = "0.5.0"\napi = "0.21.0"\nperm = "0.4.0"');
  expect(out).not.toContain("# [versions]");
  expect(Bun.TOML.parse(out)).toMatchObject({
    versions: { auth: "0.5.0", api: "0.21.0", perm: "0.4.0" },
  });
});

test("pinVersionsInToml leaves the file unchanged without versions", () => {
  expect(pinVersionsInToml(template, {})).toBe(template);
});
