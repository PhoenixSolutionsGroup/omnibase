import { describe, expect, test } from "bun:test";
import fs from "fs";
import path from "path";
import { extractPermitRules, permitRulesToSql, UnsupportedPermitError } from "./rules";

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

describe("permitRulesToSql", () => {
  test("replaces all rules in one transaction and escapes quotes", () => {
    const sql = permitRulesToSql([
      { namespace: "Doc", permit: "it's", kind: "traverse", source: "folder", viaPermit: "view" },
    ]);
    expect(sql).toContain("DELETE FROM auth.permit_rules;");
    expect(sql).toContain("('Doc', 'it''s', 'traverse', 'folder', 'view')");
    expect(sql.startsWith("BEGIN;")).toBe(true);
  });
});
