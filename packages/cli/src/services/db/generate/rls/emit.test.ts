import { test, expect, describe, beforeEach } from "bun:test";
import type { BaseDMMF } from "@prisma/client/runtime/library";
import { generateRlsSql } from "./emit";
import { loadSchema } from "./schema";
import { definePolicy, clearRegistry } from "../policies";
import type { AuthCtx } from "../policies";

const scalar = (name: string) => ({ name, kind: "scalar", type: "String" });

const dmmf = {
  datamodel: {
    models: [
      {
        name: "projects",
        dbName: null,
        fields: [scalar("id"), scalar("tenant_id"), scalar("published")],
      },
      {
        name: "Account",
        dbName: "accounts",
        fields: [scalar("id"), scalar("tenant_id")],
      },
    ],
  },
} as unknown as BaseDMMF;

const tenant = (a: AuthCtx) => ({ tenant_id: a.tenantId });
const GUARD =
  "(auth.user_id() IS NOT NULL AND projects.tenant_id::text = auth.active_tenant_id())";

beforeEach(() => {
  clearRegistry();
  loadSchema(dmmf);
});

describe("generateRlsSql", () => {
  test("unregistered model yields empty SQL", () => {
    expect(generateRlsSql("projects")).toEqual({ upSQL: "", downSQL: "" });
  });

  test("emits anon and auth policies per operation in a stable order", () => {
    definePolicy<any>("projects", {
      select: {
        anon: { using: { published: true } },
        auth: { using: tenant },
      },
      insert: { anon: { check: false }, auth: { check: tenant } },
      delete: { anon: { using: false }, auth: { using: true } },
    });

    const { upSQL } = generateRlsSql("projects");

    expect(upSQL).toBe(
      [
        "ALTER TABLE projects ENABLE ROW LEVEL SECURITY;",
        "",
        'CREATE POLICY "projects_insert_auth" ON projects',
        "  FOR INSERT",
        `  WITH CHECK (${GUARD});`,
        "",
        'CREATE POLICY "projects_select_anon" ON projects',
        "  FOR SELECT",
        "  USING (projects.published = true);",
        "",
        'CREATE POLICY "projects_select_auth" ON projects',
        "  FOR SELECT",
        `  USING (${GUARD});`,
        "",
        'CREATE POLICY "projects_delete_auth" ON projects',
        "  FOR DELETE",
        "  USING (auth.user_id() IS NOT NULL);",
      ].join("\n"),
    );
  });

  test("update emits both USING and WITH CHECK", () => {
    definePolicy<any>("projects", {
      update: {
        anon: { using: false, check: false },
        auth: { using: tenant, check: tenant },
      },
    });

    const { upSQL } = generateRlsSql("projects");

    expect(upSQL).toContain(
      [
        'CREATE POLICY "projects_update_auth" ON projects',
        "  FOR UPDATE",
        `  USING (${GUARD})`,
        `  WITH CHECK (${GUARD});`,
      ].join("\n"),
    );
  });

  test("an operation with no policy entry is omitted", () => {
    definePolicy<any>("projects", {
      select: { anon: { using: true } },
    });

    const { upSQL } = generateRlsSql("projects");
    expect(upSQL).toContain("projects_select_anon");
    expect(upSQL).not.toContain("projects_insert");
    expect(upSQL).not.toContain("projects_update");
    expect(upSQL).not.toContain("projects_delete");
  });

  test("downSQL drops every emitted policy and disables RLS", () => {
    definePolicy<any>("projects", {
      select: { anon: { using: true }, auth: { using: tenant } },
    });

    const { downSQL } = generateRlsSql("projects");
    expect(downSQL).toBe(
      [
        'DROP POLICY IF EXISTS "projects_select_anon" ON projects;',
        'DROP POLICY IF EXISTS "projects_select_auth" ON projects;',
        "ALTER TABLE projects DISABLE ROW LEVEL SECURITY;",
      ].join("\n"),
    );
  });

  test("uses the DMMF dbName as the table name", () => {
    definePolicy<any>("Account", {
      select: { anon: { using: true } },
    });

    const { upSQL } = generateRlsSql("Account");
    expect(upSQL).toContain("ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;");
    expect(upSQL).toContain('CREATE POLICY "accounts_select_anon" ON accounts');
  });
});
