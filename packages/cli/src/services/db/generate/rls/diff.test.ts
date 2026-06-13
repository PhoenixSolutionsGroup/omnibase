import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import type { BaseDMMF } from "@prisma/client/runtime/library";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateRlsDiffFromMigrations } from "./diff";
import { generateRlsSql } from "./emit";
import { loadSchema } from "./schema";
import { definePolicy, clearRegistry } from "../policies";

const scalar = (name: string) => ({ name, kind: "scalar", type: "String" });

const dmmf = {
  datamodel: {
    models: [
      {
        name: "projects",
        dbName: null,
        fields: [scalar("id"), scalar("published")],
      },
    ],
  },
} as unknown as BaseDMMF;

let dir: string;

const migration = (name: string, sql: string) => {
  mkdirSync(join(dir, name), { recursive: true });
  writeFileSync(join(dir, name, "migration.sql"), sql);
};

beforeEach(() => {
  clearRegistry();
  loadSchema(dmmf);
  dir = mkdtempSync(join(tmpdir(), "rls-diff-"));
  definePolicy<any>("projects", { select: { anon: { using: { published: true } } } });
});

afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe("generateRlsDiffFromMigrations", () => {
  test("with no prior migrations it enables RLS and creates every policy", () => {
    const { upSQL, downSQL } = generateRlsDiffFromMigrations(dir, ["projects"]);

    expect(upSQL).toContain("ALTER TABLE projects ENABLE ROW LEVEL SECURITY;");
    expect(upSQL).toContain('DROP POLICY IF EXISTS "projects_select_anon" ON projects;');
    expect(upSQL).toContain('CREATE POLICY "projects_select_anon" ON projects');
    expect(downSQL).toContain("ALTER TABLE projects DISABLE ROW LEVEL SECURITY;");
  });

  test("an unchanged policy produces no diff", () => {
    migration("100_init", generateRlsSql("projects").upSQL);

    expect(generateRlsDiffFromMigrations(dir, ["projects"])).toEqual({
      upSQL: "",
      downSQL: "",
    });
  });

  test("a changed predicate drops and recreates only the changed policy", () => {
    const stale = generateRlsSql("projects").upSQL.replace(
      "projects.published = true",
      "projects.published = false",
    );
    migration("100_init", stale);

    const { upSQL, downSQL } = generateRlsDiffFromMigrations(dir, ["projects"]);

    expect(upSQL).toContain('DROP POLICY IF EXISTS "projects_select_anon" ON projects;');
    expect(upSQL).toContain("projects.published = true");
    expect(upSQL).not.toContain("ALTER TABLE projects ENABLE ROW LEVEL SECURITY;");
    expect(downSQL).toContain("-- RLS policy rollback 100_init");
    expect(downSQL).toContain("projects.published = false");
  });

  test("excludeNewerThan ignores the named migration when reading history", () => {
    migration("100_init", generateRlsSql("projects").upSQL);

    const diff = generateRlsDiffFromMigrations(dir, ["projects"], "100_init");
    expect(diff.upSQL).toContain('CREATE POLICY "projects_select_anon" ON projects');
  });
});
