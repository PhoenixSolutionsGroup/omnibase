import { describe, expect, test } from "bun:test";
import {
  CHANGELOG_PACKAGES,
  cleanBody,
  parseChangelog,
  renderCombinedPage,
  renderSectionPage,
  versionUrl,
} from "./generate-changelogs";

const cli = CHANGELOG_PACKAGES.find((p) => p.id === "cli")!;
const auth = CHANGELOG_PACKAGES.find((p) => p.id === "auth")!;

const sample = `# [0.12.0](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.11.0...cli-v0.12.0) (2026-10-29)


### Bug Fixes

* **cli:** restart permissions ([64b799e](https://github.com/PhoenixSolutionsGroup/omnibase/commit/64b799eec257c243a0bd6e5e14757d67b47f0b09))
* **cli:** sync auth docker image to 0.4.4 [skip ci] ([4fac94c](https://github.com/PhoenixSolutionsGroup/omnibase/commit/4fac94c95f9b771309ee6135deaee010189285b3))


### Features

* **cli:** sync api docker image to 0.21.0 [skip ci] ([edd306c](https://github.com/PhoenixSolutionsGroup/omnibase/commit/edd306c043309a917d776f49243ad4a8240140cb))

## [0.11.1](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.11.0...cli-v0.11.1) (2026-10-20)

### Bug Fixes

* handle \`Record<string, T>\` and <Tags> in {braces} [skip ci] ([aaaaaaa](https://github.com/PhoenixSolutionsGroup/omnibase/commit/aaaaaaabbbbbbbccccccc))

## [0.11.1](https://github.com/PhoenixSolutionsGroup/omnibase/compare/cli-v0.11.0...cli-v0.11.1) (2026-10-20)

### Bug Fixes

* duplicate entry written twice by the release tool

# Change Log

All notable changes to this project will be documented in this file.

# @omnibase/cli

## 0.0.1

### Patch Changes

- 91f64a0: first release
`;

describe("parseChangelog", () => {
  test("reads versions, dates and compare links, newest first", () => {
    const releases = parseChangelog(sample);
    expect(releases.map((r) => r.version)).toEqual(["0.12.0", "0.11.1", "0.0.1"]);
    expect(releases[0].date).toBe("2026-10-29");
    expect(releases[0].compareUrl).toContain("cli-v0.11.0...cli-v0.12.0");
    expect(releases[2].date).toBeUndefined();
  });

  test("ignores non-release headings and their text", () => {
    const releases = parseChangelog(sample);
    expect(releases.some((r) => r.body.includes("All notable changes"))).toBe(false);
  });
});

describe("cleanBody", () => {
  test("drops docker image sync entries and sections left empty", () => {
    const body = cleanBody(parseChangelog(sample)[0].body);
    expect(body).not.toContain("sync");
    expect(body).not.toContain("**Features**");
    expect(body).toContain("**Bug Fixes**");
  });

  test("shortens commit links and strips [skip ci]", () => {
    const body = cleanBody(parseChangelog(sample)[1].body);
    expect(body).toContain(
      "[aaaaaaa](https://github.com/PhoenixSolutionsGroup/omnibase/commit/aaaaaaabbbbbbbccccccc)",
    );
    expect(body).not.toContain("([aaaaaaa]");
    expect(body).not.toContain("skip ci");
  });

  test("escapes MDX syntax outside code spans", () => {
    const body = cleanBody(parseChangelog(sample)[1].body);
    expect(body).toContain("`Record<string, T>`");
    expect(body).toContain("\\<Tags\\> in \\{braces\\}");
  });
});

describe("versionUrl", () => {
  const [latest, older, legacy] = parseChangelog(sample);
  const docsExist = (section: string, version: string) =>
    section === "cli" && version === "0.12.0";

  test("links to the versioned docs when they exist", () => {
    expect(versionUrl(cli, latest, docsExist)).toBe("/cli/0.12.0");
  });

  test("links to the GitHub release when the docs are gone", () => {
    expect(versionUrl(cli, older, docsExist)).toBe(
      "https://github.com/PhoenixSolutionsGroup/omnibase/releases/tag/cli-v0.11.1",
    );
  });

  test("links to the changelog file for untagged legacy releases", () => {
    expect(versionUrl(cli, legacy, docsExist)).toBe(
      "https://github.com/PhoenixSolutionsGroup/omnibase/blob/main/packages/cli/CHANGELOG.md",
    );
  });

  test("links services without docs to GitHub", () => {
    expect(versionUrl(auth, { ...latest, compareUrl: undefined }, () => true)).toBe(
      "https://github.com/PhoenixSolutionsGroup/omnibase/releases/tag/auth-v0.12.0",
    );
  });
});

describe("renderSectionPage", () => {
  const page = renderSectionPage(cli, "0.12.0", parseChangelog(sample), () => true);

  test("shows the latest version and a docs button before the changelog", () => {
    expect(page).toContain("**Latest: v0.12.0**");
    expect(page).toContain('<Card title="Read the CLI v0.12.0 docs" href="/cli/0.12.0" />');
    expect(page.indexOf("Read the CLI")).toBeLessThan(page.indexOf("## v0.12.0"));
  });

  test("lists releases newest first", () => {
    expect(page.indexOf("## v0.12.0")).toBeLessThan(page.indexOf("## v0.11.1"));
  });

  test("links each version under its heading", () => {
    expect(page).toContain("## v0.12.0\n\n[Docs](/cli/0.12.0) · 2026-10-29 · [Compare changes]");
  });
});

describe("renderCombinedPage", () => {
  test("merges packages by date and tags each entry with its package", () => {
    const authRelease = {
      version: "0.4.4",
      date: "2026-10-25",
      compareUrl: "https://github.com/PhoenixSolutionsGroup/omnibase/compare/auth-v0.4.3...auth-v0.4.4",
      body: "* fix",
    };
    const [latest, older] = parseChangelog(sample);
    const page = renderCombinedPage(
      [
        { pkg: cli, release: older },
        { pkg: auth, release: authRelease },
        { pkg: cli, release: latest },
      ],
      () => false,
    );

    const order = ["CLI v0.12.0", "Auth v0.4.4", "CLI v0.11.1"].map((h) => page.indexOf(h));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(page).toContain('<ChangelogEntry package="auth">');
    expect(page).toContain('"id":"permissions"');
  });
});
