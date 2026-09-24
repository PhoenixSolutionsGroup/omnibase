import { test, expect } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import JSZip from "jszip";
import { packageWorkerBundle } from "./cloud";

function makeWorkersDir(root: string): string {
  const workersDir = join(root, "omnibase", "workers");
  mkdirSync(join(workersDir, ".bundle"), { recursive: true });
  writeFileSync(
    join(workersDir, "wrangler.toml"),
    `name = "dashboard"
main = "src/index.ts"

[vars]
WEBSITE_URL = "{WEBSITE_URL}"
DATABASE_URL = "literal-db-url"
`,
  );
  writeFileSync(join(workersDir, ".bundle", "index.js"), "export default {};");
  return workersDir;
}

test("packageWorkerBundle interpolates {VAR} from the secrets map", async () => {
  const root = mkdtempSync(join(tmpdir(), "omni-bundle-"));
  try {
    const bundle = await packageWorkerBundle(makeWorkersDir(root), {
      WEBSITE_URL: "https://dev.omnibase.tech",
    });

    const zip = await JSZip.loadAsync(bundle);
    const config = JSON.parse(await zip.file("wrangler.json")!.async("string"));

    expect(config.vars.WEBSITE_URL).toBe("https://dev.omnibase.tech");
    expect(config.vars.DATABASE_URL).toBe("literal-db-url");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("packageWorkerBundle leaves undeclared vars and unresolved {VAR} untouched", async () => {
  const root = mkdtempSync(join(tmpdir(), "omni-bundle-"));
  try {
    const bundle = await packageWorkerBundle(makeWorkersDir(root), {
      COOKIE_SECRET: "super-secret",
    });

    const zip = await JSZip.loadAsync(bundle);
    const config = JSON.parse(await zip.file("wrangler.json")!.async("string"));

    expect(config.vars.WEBSITE_URL).toBe("{WEBSITE_URL}");
    expect(config.vars.DATABASE_URL).toBe("literal-db-url");
    expect(JSON.stringify(config.vars)).not.toContain("super-secret");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});