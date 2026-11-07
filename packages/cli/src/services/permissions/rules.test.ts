import { describe, expect, test } from "bun:test";
import fs from "fs";
import path from "path";
import {
  buildPermitModel,
  extractPermitRules,
  parsePermissionFile,
  permitModelToSql,
  UnsupportedPermitError,
} from "./rules";

const ns = (body: string) => `class Thing implements Namespace {\n  permits = {\n    ${body}\n  };\n}`;

describe("extractPermitRules", () => {
  test("relations joined with ||", () => {
    const rules = extractPermitRules(
      ns(`read: (ctx: Context): boolean =>
        this.related.owner.includes(ctx.subject) || (this.related.can_read.includes(ctx.subject)),`),
    );
    expect(rules).toEqual([
      { namespace: "Thing", permit: "read", kind: "relation", source: "owner" },
      { namespace: "Thing", permit: "read", kind: "relation", source: "can_read" },
    ]);
  });

  test("traverse to a parent permit", () => {
    const rules = extractPermitRules(
      ns(`view: (ctx) => this.related.folder.traverse((f) => f.permits.view(ctx)),`),
    );
    expect(rules).toEqual([
      { namespace: "Thing", permit: "view", kind: "traverse", source: "folder", viaPermit: "view" },
    ]);
  });

  test("traverse to a parent relation", () => {
    const rules = extractPermitRules(
      ns(`view: (ctx) => this.related.tenant.traverse((t) => t.related.members.includes(ctx.subject)),`),
    );
    expect(rules).toEqual([
      { namespace: "Thing", permit: "view", kind: "traverse", source: "tenant", viaPermit: "members" },
    ]);
  });

  test("permit referencing another permit, block body", () => {
    const rules = extractPermitRules(
      ns(`view: (ctx) => { return this.permits.edit(ctx); },`),
    );
    expect(rules).toEqual([{ namespace: "Thing", permit: "view", kind: "permit", source: "edit" }]);
  });

  test("rejects && and !", () => {
    expect(() =>
      extractPermitRules(ns(`x: (ctx) => this.related.a.includes(ctx.subject) && this.related.b.includes(ctx.subject),`)),
    ).toThrow(UnsupportedPermitError);
    expect(() => extractPermitRules(ns(`x: (ctx) => !this.related.a.includes(ctx.subject),`))).toThrow(
      UnsupportedPermitError,
    );
  });

  test("namespaces without permits produce no rules", () => {
    expect(extractPermitRules("class User implements Namespace {}")).toEqual([]);
  });

  test("bundled templates are all supported", () => {
    const dir = path.join(__dirname, "../../../templates/permissions");
    for (const file of ["storage.ts", "tenants.ts"]) {
      const rules = extractPermitRules(fs.readFileSync(path.join(dir, file), "utf-8"), file);
      expect(rules.length).toBeGreaterThan(0);
    }
  });
});

const BENCH = `
class User implements Namespace {}
class Group implements Namespace {
  related: { members: User[] };
}
class Folder implements Namespace {
  related: {
    member: (User | SubjectSet<Group, "members">)[];
    parent: Folder[];
  };
  permits = {
    view: (ctx: Context): boolean =>
      this.related.member.includes(ctx.subject) ||
      this.related.parent.traverse((p) => p.permits.view(ctx)),
  };
}
`;

const DOCS = `
class Document implements Namespace {
  related: {
    owner: User[];
    viewer: Array<User | SubjectSet<Group, "members">>;
    folder: Folder[];
  };
  permits = {
    view: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.viewer.includes(ctx.subject) ||
      this.related.folder.traverse((f) => f.permits.view(ctx)),
    edit: (ctx: Context): boolean => this.related.owner.includes(ctx.subject),
  };
}
`;

describe("buildPermitModel", () => {
  test("expands rule sources, traverse targets and declared subject sets only", () => {
    const model = buildPermitModel([parsePermissionFile(BENCH), parsePermissionFile(DOCS)]);
    const keys = model.expandable.map((e) => `${e.namespace}#${e.relation}`).sort();
    expect(keys).toEqual([
      "Document#owner",
      "Document#viewer",
      "Folder#member",
      "Folder#view",
      "Group#members",
    ]);
  });

  test("traverse targets resolve across files", () => {
    const model = buildPermitModel([parsePermissionFile(DOCS), parsePermissionFile(BENCH)]);
    expect(model.expandable).toContainEqual({ namespace: "Folder", relation: "view" });
  });

  test("traversing a relation without a namespace type is rejected", () => {
    const src = `class Doc implements Namespace {
      related: { folder: any };
      permits = { view: (ctx) => this.related.folder.traverse((f) => f.permits.view(ctx)) };
    }`;
    expect(() => buildPermitModel([parsePermissionFile(src)])).toThrow(UnsupportedPermitError);
  });
});

describe("permitModelToSql", () => {
  test("replaces rules and expandable rows in one transaction and escapes quotes", () => {
    const sql = permitModelToSql({
      rules: [{ namespace: "Doc", permit: "it's", kind: "traverse", source: "folder", viaPermit: "view" }],
      expandable: [{ namespace: "Folder", relation: "view" }],
    });
    expect(sql.startsWith("BEGIN;")).toBe(true);
    expect(sql).toContain("DELETE FROM permissions.permit_rules;");
    expect(sql).toContain("DELETE FROM permissions.permit_expandable;");
    expect(sql).toContain("('Doc', 'it''s', 'traverse', 'folder', 'view')");
    expect(sql).toContain("('Folder', 'view')");
  });
});
