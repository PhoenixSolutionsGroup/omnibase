import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import path from "path";
import {
  deriveShadowUrls,
  ensureMigrationLock,
  SHADOW_DB_NAME,
} from "./utils";

describe("deriveShadowUrls", () => {
  const dbUrl = "postgres://user:pass@localhost:5432/omnibase";

  test("maintenance url points at the postgres database", () => {
    const { maintUrl } = deriveShadowUrls(dbUrl);
    expect(new URL(maintUrl).pathname).toBe("/postgres");
  });

  test("shadow url points at the shadow database", () => {
    const { shadowUrl } = deriveShadowUrls(dbUrl);
    expect(new URL(shadowUrl).pathname).toBe(`/${SHADOW_DB_NAME}`);
  });

  test("suffix is appended to the shadow database name", () => {
    const { shadowUrl } = deriveShadowUrls(dbUrl, "_42");
    expect(new URL(shadowUrl).pathname).toBe(`/${SHADOW_DB_NAME}_42`);
  });

  test("preserves credentials, host and port", () => {
    const { maintUrl } = deriveShadowUrls(dbUrl);
    const u = new URL(maintUrl);
    expect(u.username).toBe("user");
    expect(u.password).toBe("pass");
    expect(u.host).toBe("localhost:5432");
  });
});

describe("ensureMigrationLock", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "omni-lock-"));
  });
  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test("writes a postgresql lock file when absent", () => {
    ensureMigrationLock(tmp);
    const lock = fs.readFileSync(
      path.join(tmp, "migration_lock.toml"),
      "utf8",
    );
    expect(lock).toContain('provider = "postgresql"');
  });

  test("does not overwrite an existing lock file", () => {
    const lockPath = path.join(tmp, "migration_lock.toml");
    fs.writeFileSync(lockPath, "custom");
    ensureMigrationLock(tmp);
    expect(fs.readFileSync(lockPath, "utf8")).toBe("custom");
  });
});
