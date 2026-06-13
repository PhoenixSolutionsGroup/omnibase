import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import path from "path";
import AdmZip from "adm-zip";
import { ensureMigrationDir, zipMigrationsDir } from "./utils";

let tmp: string;

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "omni-migrate-"));
});

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

const writeMigration = (
  dir: string,
  name: string,
  files: Record<string, string>,
) => {
  const d = path.join(dir, name);
  fs.mkdirSync(d, { recursive: true });
  for (const [f, content] of Object.entries(files))
    fs.writeFileSync(path.join(d, f), content);
};

describe("ensureMigrationDir", () => {
  test("creates the directory when missing", () => {
    const target = path.join(tmp, "nested", "migrations");
    ensureMigrationDir(target);
    expect(fs.existsSync(target)).toBe(true);
  });

  test("is a no-op when the directory exists", () => {
    expect(() => ensureMigrationDir(tmp)).not.toThrow();
    expect(fs.existsSync(tmp)).toBe(true);
  });
});

describe("zipMigrationsDir", () => {
  test("throws when the migrations directory does not exist", () => {
    expect(() => zipMigrationsDir(path.join(tmp, "missing"))).toThrow(
      /No migrations directory found/,
    );
  });

  test("throws when there are no migration subdirectories", () => {
    expect(() => zipMigrationsDir(tmp)).toThrow(
      /No migration directories found/,
    );
  });

  test("throws when subdirectories contain no sql files", () => {
    fs.mkdirSync(path.join(tmp, "100_empty"));
    expect(() => zipMigrationsDir(tmp)).toThrow(/No migration.sql files/);
  });

  test("zips migration.sql and down.sql under their dir name", () => {
    writeMigration(tmp, "100_a", {
      "migration.sql": "CREATE TABLE a();",
      "down.sql": "DROP TABLE a;",
    });
    writeMigration(tmp, "200_b", { "migration.sql": "CREATE TABLE b();" });

    const zip = zipMigrationsDir(tmp);
    const names = zip
      .getEntries()
      .map((e: AdmZip.IZipEntry) => e.entryName)
      .sort();

    expect(names).toEqual([
      "100_a/down.sql",
      "100_a/migration.sql",
      "200_b/migration.sql",
    ]);
  });
});
