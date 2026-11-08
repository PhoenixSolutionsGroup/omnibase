import { test, expect, describe, beforeEach } from "bun:test";
import type { BaseDMMF } from "@prisma/client/runtime/library";
import { generateRlsSql } from "./emit";
import { loadSchema } from "./schema";
import { can, definePolicy, clearRegistry } from "../policies";

class User {}

class Document {
  related!: {
    owner: User[];
    viewer: User[];
  };

  permits = {
    view: (): boolean => true,
    edit: (): boolean => true,
  };
}

const dmmf = {
  datamodel: {
    models: [
      {
        name: "documents",
        dbName: null,
        fields: [
          { name: "id", kind: "scalar", type: "String", nativeType: ["Uuid", []] },
          { name: "slug", kind: "scalar", type: "String" },
          { name: "num", kind: "scalar", type: "Int" },
          { name: "tenant_id", kind: "scalar", type: "String" },
        ],
      },
    ],
  },
} as unknown as BaseDMMF;

type Doc = { id?: string; slug?: string; num?: number; tenant_id?: string };

beforeEach(() => {
  clearRegistry();
  loadSchema(dmmf);
});

describe("can() in policies", () => {
  test("using matches rows on the Keto UUID index", () => {
    definePolicy<Doc>("documents", {
      select: { anon: { using: false }, auth: { using: { id: can(Document, "view") } } },
    });
    const { upSQL } = generateRlsSql("documents");
    expect(upSQL).toContain(
      "permissions.keto_uuid(documents.id::text) = ANY (ARRAY(SELECT permissions.allowed_objects('Document', 'view')))",
    );
  });

  test("check compiles to a single can() call", () => {
    definePolicy<Doc>("documents", {
      update: {
        anon: { using: false },
        auth: { using: { id: can(Document, "edit") }, check: { id: can(Document, "edit") } },
      },
    });
    const { upSQL } = generateRlsSql("documents");
    expect(upSQL).toContain("permissions.allowed_objects('Document', 'edit')");
    expect(upSQL).toContain("permissions.can('Document', documents.id::text, 'edit')");
  });

  test("emits one Keto UUID index per column, created before the policies", () => {
    definePolicy<Doc>("documents", {
      select: { anon: { using: false }, auth: { using: { id: can(Document, "view") } } },
      update: {
        anon: { using: false },
        auth: { using: { id: can(Document, "edit"), slug: can(Document, "owner") } },
      },
    });
    const { upSQL, downSQL, ketoIndexes } = generateRlsSql("documents");
    expect(ketoIndexes).toEqual([
      { table: "documents", column: "id" },
      { table: "documents", column: "slug" },
    ]);
    const ensure = upSQL.indexOf("SELECT permissions.ensure_keto_uuid();");
    const index = upSQL.indexOf(
      "CREATE INDEX IF NOT EXISTS documents_id_keto_idx ON documents (permissions.keto_uuid(id::text));",
    );
    const policy = upSQL.indexOf("CREATE POLICY");
    expect(ensure).toBeGreaterThan(-1);
    expect(ensure).toBeLessThan(index);
    expect(index).toBeLessThan(policy);
    expect(upSQL.match(/documents_id_keto_idx/g)?.length).toBe(1);
    expect(downSQL).toContain("DROP INDEX IF EXISTS documents_id_keto_idx;");
    expect(downSQL).toContain("DROP INDEX IF EXISTS documents_slug_keto_idx;");
  });

  test("check-only policies need no index", () => {
    definePolicy<Doc>("documents", {
      insert: { anon: { check: false }, auth: { check: { id: can(Document, "edit") } } },
    });
    const out = generateRlsSql("documents");
    expect(out.ketoIndexes).toBeUndefined();
    expect(out.upSQL).not.toContain("ensure_keto_uuid");
  });

  test("combines with other filters", () => {
    definePolicy<Doc>("documents", {
      select: {
        anon: { using: false },
        auth: { using: (a) => ({ tenant_id: a.tenantId, id: can(Document, "view") }) },
      },
    });
    const { upSQL } = generateRlsSql("documents");
    expect(upSQL).toContain("documents.tenant_id::text = auth.active_tenant_id()");
    expect(upSQL).toContain("permissions.allowed_objects('Document', 'view')");
  });

  test("permit and relation names are type-checked", () => {
    // @ts-expect-error "veiw" is not a permit or relation on Document
    can(Document, "veiw");
    // @ts-expect-error namespaces must be classes, not strings
    expect(() => can("Document", "view")).toThrow();
    expect(can(Document, "viewer").permit).toBe("viewer");
  });
});
