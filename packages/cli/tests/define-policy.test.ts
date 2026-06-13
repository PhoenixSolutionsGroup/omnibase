import { test, expect, describe, beforeEach } from "bun:test";
import type { BaseDMMF } from "@prisma/client/runtime/library";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { definePolicy, clearRegistry, getRegistry } from "../src/services/db/generate/policies";
import type { AuthCtx } from "../src/services/db/generate/policies";
import {
  loadSchema,
  generateRlsSql,
  generateRlsDiffFromMigrations,
} from "../src/services/db/generate/rls-policies";

const scalar = (name: string) => ({ name, kind: "scalar", type: "String" });
const relation = (
  name: string,
  type: string,
  relationName: string,
  relationFromFields: string[],
) => ({ name, kind: "object", type, relationName, relationFromFields });

const dmmf = {
  datamodel: {
    models: [
      {
        name: "projects",
        dbName: null,
        fields: [scalar("id"), scalar("name"), scalar("tenant_id"), scalar("published")],
      },
      {
        name: "charts",
        dbName: null,
        fields: [
          scalar("id"),
          scalar("project_id"),
          relation("project", "projects", "ChartProject", ["project_id"]),
          relation("points", "points", "ChartPoint", []),
        ],
      },
      {
        name: "points",
        dbName: null,
        fields: [
          scalar("id"),
          scalar("chart_id"),
          relation("chart", "charts", "ChartPoint", ["chart_id"]),
        ],
      },
    ],
  },
} as unknown as BaseDMMF;

const tenant = (a: AuthCtx) => ({ tenant_id: a.tenantId });
const GUARD =
  "(auth.user_id() IS NOT NULL AND projects.tenant_id::text = auth.active_tenant_id())";

const defineProjectsPolicy = () =>
  definePolicy<any>("projects", {
    select: { anon: { using: false }, auth: { using: tenant } },
    insert: { anon: { check: false }, auth: { check: tenant } },
    update: {
      anon: { check: false, using: false },
      auth: { check: tenant, using: tenant },
    },
    delete: { anon: { using: false }, auth: { using: true } },
  });

beforeEach(() => {
  clearRegistry();
  loadSchema(dmmf);
});

describe("definePolicy + RLS generation end to end", () => {
  test("definePolicy registers under the model name", () => {
    defineProjectsPolicy();
    expect([...getRegistry().keys()]).toEqual(["projects"]);
  });

  test("definePolicy rejects an operation that omits anon", () => {
    expect(() =>
      definePolicy<any>("projects", { select: { auth: { using: true } } as any }),
    ).toThrow(/must declare `anon`/);
  });

  test("a tenant-scoped policy compiles to the expected RLS SQL", () => {
    defineProjectsPolicy();

    expect(generateRlsSql("projects").upSQL).toBe(
      [
        "ALTER TABLE projects ENABLE ROW LEVEL SECURITY;",
        "",
        'CREATE POLICY "projects_insert_auth" ON projects',
        "  FOR INSERT",
        `  WITH CHECK (${GUARD});`,
        "",
        'CREATE POLICY "projects_select_auth" ON projects',
        "  FOR SELECT",
        `  USING (${GUARD});`,
        "",
        'CREATE POLICY "projects_update_auth" ON projects',
        "  FOR UPDATE",
        `  USING (${GUARD})`,
        `  WITH CHECK (${GUARD});`,
        "",
        'CREATE POLICY "projects_delete_auth" ON projects',
        "  FOR DELETE",
        "  USING (auth.user_id() IS NOT NULL);",
      ].join("\n"),
    );
  });

  test("a single-level relation join compiles to a tenant EXISTS subquery", () => {
    definePolicy<any>("charts", {
      select: { anon: { using: false }, auth: { using: (a: AuthCtx) => ({ project: { tenant_id: a.tenantId } }) } },
    });

    expect(generateRlsSql("charts").upSQL).toContain(
      "USING ((auth.user_id() IS NOT NULL AND " +
        "EXISTS (SELECT 1 FROM projects project WHERE project.id = charts.project_id " +
        "AND project.tenant_id::text = auth.active_tenant_id())));",
    );
  });

  test("a two-level relation join nests EXISTS subqueries", () => {
    definePolicy<any>("points", {
      select: {
        anon: { using: false },
        auth: { using: (a: AuthCtx) => ({ chart: { project: { tenant_id: a.tenantId } } }) },
      },
    });

    expect(generateRlsSql("points").upSQL).toContain(
      "EXISTS (SELECT 1 FROM charts chart WHERE chart.id = points.chart_id AND " +
        "EXISTS (SELECT 1 FROM projects project WHERE project.id = chart.project_id AND " +
        "project.tenant_id::text = auth.active_tenant_id()))",
    );
  });

  test("a comparison + LIKE predicate compiles end to end", () => {
    definePolicy<any>("projects", {
      select: {
        anon: {
          using: {
            OR: [{ name: { startsWith: "pub-" } }, { published: true }],
          },
        },
      },
    });

    expect(generateRlsSql("projects").upSQL).toContain(
      "USING (( projects.name LIKE 'pub-%'\n    OR projects.published = true ));",
    );
  });

  test("a fresh migration directory yields the full create + an idempotent re-run yields nothing", () => {
    defineProjectsPolicy();
    const dir = mkdtempSync(join(tmpdir(), "rls-e2e-"));
    try {
      const first = generateRlsDiffFromMigrations(dir, ["projects"]);
      expect(first.upSQL).toContain("ALTER TABLE projects ENABLE ROW LEVEL SECURITY;");
      for (const name of [
        "projects_insert_auth",
        "projects_select_auth",
        "projects_update_auth",
        "projects_delete_auth",
      ]) {
        expect(first.upSQL).toContain(`CREATE POLICY "${name}" ON projects`);
      }

      mkdirSync(join(dir, "100_init"), { recursive: true });
      writeFileSync(join(dir, "100_init", "migration.sql"), first.upSQL);

      expect(generateRlsDiffFromMigrations(dir, ["projects"])).toEqual({
        upSQL: "",
        downSQL: "",
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
