import { test, expect } from "bun:test";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildVersionsOverrideCompose } from "./docker";

test("builds override compose pinning the declared images", () => {
  const root = mkdtempSync(join(tmpdir(), "omni-ovr-"));
  try {
    const overridePath = buildVersionsOverrideCompose(root, {
      auth: "0.4.1",
      api: "0.20.3",
      perm: "0.4.0",
    });

    expect(overridePath).not.toBeNull();
    const body = readFileSync(overridePath!, "utf-8");
    expect(body).toContain("  auth:\n    image: phoenixsolutionsgroup/omnibase-auth:0.4.1");
    expect(body).toContain("  auth-migrate:\n    image: phoenixsolutionsgroup/omnibase-auth:0.4.1");
    expect(body).toContain("  rest-api:\n    image: phoenixsolutionsgroup/omnibase-api:0.20.3");
    expect(body).toContain("  permissions:\n    image: phoenixsolutionsgroup/omnibase-permissions:0.4.0");
    expect(body).toContain("  permissions-migrate:\n    image: phoenixsolutionsgroup/omnibase-permissions:0.4.0");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("returns null when nothing to override", () => {
  const root = mkdtempSync(join(tmpdir(), "omni-null-"));
  try {
    expect(buildVersionsOverrideCompose(root, {})).toBeNull();
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});