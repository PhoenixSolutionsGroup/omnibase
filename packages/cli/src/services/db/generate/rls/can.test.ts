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
  test("using compiles to allowed_ids with the column's type", () => {
    definePolicy<Doc>("documents", {
      select: { anon: { using: false }, auth: { using: { id: can(Document, "view") } } },
    });
    const { upSQL } = generateRlsSql("documents");
    expect(upSQL).toContain(
      "documents.id = ANY (ARRAY(SELECT permissions.allowed_ids('Document', 'view')::uuid))",
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
    expect(upSQL).toContain("USING ((auth.user_id() IS NOT NULL AND documents.id = ANY (ARRAY(SELECT permissions.allowed_ids('Document', 'edit')::uuid))))");
    expect(upSQL).toContain("permissions.can('Document', documents.id::text, 'edit')");
  });

  test("text and int columns get matching casts", () => {
    definePolicy<Doc>("documents", {
      select: {
        anon: { using: false },
        auth: { using: { slug: can(Document, "owner"), num: can(Document, "view") } },
      },
    });
    const { upSQL } = generateRlsSql("documents");
    expect(upSQL).toContain("documents.slug = ANY (ARRAY(SELECT permissions.allowed_ids('Document', 'owner')))");
    expect(upSQL).toContain("documents.num = ANY (ARRAY(SELECT permissions.allowed_ids('Document', 'view')::int))");
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
    expect(upSQL).toContain("permissions.allowed_ids('Document', 'view')");
  });

  test("permit and relation names are type-checked", () => {
    // @ts-expect-error "veiw" is not a permit or relation on Document
    can(Document, "veiw");
    // @ts-expect-error namespaces must be classes, not strings
    expect(() => can("Document", "view")).toThrow();
    expect(can(Document, "viewer").permit).toBe("viewer");
  });
});
