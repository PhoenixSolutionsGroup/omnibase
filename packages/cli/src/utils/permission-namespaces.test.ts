import { describe, expect, test } from "bun:test";
import {
  compareNamespaceSource,
  fixNamespaceSource,
  type NamespaceFile,
  type NamespaceRequirement,
} from "./permission-namespaces";

const apiFile: NamespaceFile = {
  name: "tenants.ts",
  contents: `export class Tenant implements Namespace {
  related: {
    /**
     * @group Tenant Administration
     * @displayName Delete Tenant
     * @role owner
     */
    can_delete_tenant: User[];

    /**
     * @group User Management
     * @displayName Invite Users
     * @role owner
     */
    can_invite_user: User[];
  };

  permits = {
    delete_tenant: (ctx: Context): boolean =>
      this.related.can_delete_tenant.includes(ctx.subject),

    invite_user: (ctx: Context): boolean =>
      this.related.can_invite_user.includes(ctx.subject),
  };
}
`,
};

const requirement: NamespaceRequirement = {
  namespace: "Tenant",
  file: "tenants.ts",
  relations: ["can_delete_tenant", "can_invite_user"],
  permits: ["delete_tenant", "invite_user"],
};

describe("compareNamespaceSource", () => {
  test("reports missing relations and permits but ignores extras", () => {
    const source = `export class Tenant implements Namespace {
  related: {
    can_invite_user: User[];
  };
  permits = {
    invite_user: (ctx: Context): boolean => true,
    custom: (ctx: Context): boolean => true,
  };
}`;

    const comparison = compareNamespaceSource(requirement, source);
    expect(comparison.missingClass).toBe(false);
    expect(comparison.missingRelations).toEqual(["can_delete_tenant"]);
    expect(comparison.missingPermits).toEqual(["delete_tenant"]);
  });

  test("reports a missing class", () => {
    const comparison = compareNamespaceSource(requirement, "export class Other {}");
    expect(comparison.missingClass).toBe(true);
  });
});

describe("fixNamespaceSource", () => {
  test("inserts missing members without removing existing ones", () => {
    const source = `export class Tenant implements Namespace {
  related: {
    can_invite_user: User[]
  };
  permits = {
    invite_user: (ctx: Context): boolean => true,
    custom: (ctx: Context): boolean => true
  };
}`;

    const fixed = fixNamespaceSource(source, requirement, apiFile);
    expect(fixed).toContain("custom: (ctx: Context): boolean => true");
    expect(fixed).toContain("can_delete_tenant: User[];");
    expect(fixed).toContain("this.related.can_delete_tenant.includes(ctx.subject)");

    const comparison = compareNamespaceSource(requirement, fixed);
    expect(comparison.missingClass).toBe(false);
    expect(comparison.missingRelations).toEqual([]);
    expect(comparison.missingPermits).toEqual([]);
  });

  test("adds a class-level permits block when the class has none", () => {
    const source = `export class Tenant implements Namespace {
  related: {
    can_delete_tenant: User[];
    can_invite_user: User[];
  };
}`;

    const fixed = fixNamespaceSource(source, requirement, apiFile);
    expect(fixed).toContain("permits = {");
    expect(fixed).toContain("delete_tenant: (ctx: Context): boolean =>");

    const comparison = compareNamespaceSource(requirement, fixed);
    expect(comparison.missingPermits).toEqual([]);
  });

  test("adds a class-level related block when the class has none", () => {
    const source = `export class Tenant implements Namespace {
  permits = {
    delete_tenant: (ctx: Context): boolean => true,
    invite_user: (ctx: Context): boolean => true,
  };
}`;

    const fixed = fixNamespaceSource(source, requirement, apiFile);
    expect(fixed).toContain("related: {");
    expect(fixed).toContain("can_delete_tenant: User[];");

    const comparison = compareNamespaceSource(requirement, fixed);
    expect(comparison.missingRelations).toEqual([]);
  });

  test("is a no-op when every member already exists", () => {
    const fixed = fixNamespaceSource(apiFile.contents, requirement, apiFile);
    expect(fixed).toBe(apiFile.contents);
  });

  test("appends a class when the namespace is missing", () => {
    const fixed = fixNamespaceSource("export class Other {}\n", requirement, apiFile);
    expect(fixed).toContain("export class Other {}");
    expect(fixed).toContain("export class Tenant implements Namespace");

    const comparison = compareNamespaceSource(requirement, fixed);
    expect(comparison.missingClass).toBe(false);
    expect(comparison.missingRelations).toEqual([]);
    expect(comparison.missingPermits).toEqual([]);
  });
});
