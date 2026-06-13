import { test, expect, describe, beforeEach } from "bun:test";
import type { BaseDMMF } from "@prisma/client/runtime/library";
import { objToSql, resolveAuth, authGuard } from "./compile";
import { loadSchema } from "./schema";

const USER_SENTINEL = "00000000-0000-0000-0000-000000000001";
const TENANT_SENTINEL = "00000000-0000-0000-0000-000000000002";

const scalar = (name: string) => ({ name, kind: "scalar", type: "String", isList: false });
const listScalar = (name: string) => ({ name, kind: "scalar", type: "String", isList: true });
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
        fields: [
          scalar("id"),
          scalar("tenant_id"),
          scalar("published"),
          scalar("name"),
          scalar("age"),
          listScalar("tags"),
          relation("owner", "users", "ProjectOwner", ["owner_id"]),
          relation("tasks", "tasks", "ProjectTasks", []),
        ],
      },
      {
        name: "users",
        dbName: null,
        fields: [
          scalar("id"),
          relation("manager", "users", "UserManager", ["manager_id"]),
        ],
      },
      {
        name: "tasks",
        dbName: null,
        fields: [
          scalar("id"),
          scalar("project_id"),
          relation("project", "projects", "ProjectTasks", ["project_id"]),
        ],
      },
    ],
  },
} as unknown as BaseDMMF;

beforeEach(() => loadSchema(dmmf));

describe("objToSql scalars", () => {
  test("boolean literal predicate", () => {
    expect(objToSql(true, "p")).toBe("true");
    expect(objToSql(false, "p")).toBe("false");
  });

  test("empty object is unconstrained", () => {
    expect(objToSql({}, "p")).toBe("true");
  });

  test("boolean field equality", () => {
    expect(objToSql({ published: true }, "p")).toBe("p.published = true");
  });

  test("string field equality is quoted and escaped", () => {
    expect(objToSql({ name: "a'b" }, "p")).toBe("p.name = 'a''b'");
  });

  test("uuid string casts to ::uuid", () => {
    expect(objToSql({ id: "11111111-1111-1111-1111-111111111111" }, "p")).toBe(
      "p.id = '11111111-1111-1111-1111-111111111111'::uuid",
    );
  });

  test("null becomes IS NULL", () => {
    expect(objToSql({ tenant_id: null }, "p")).toBe("p.tenant_id IS NULL");
  });
});

describe("objToSql auth sentinel substitution", () => {
  test("user sentinel becomes auth.user_id() with ::text cast", () => {
    expect(objToSql({ id: USER_SENTINEL }, "p")).toBe(
      "p.id::text = auth.user_id()",
    );
  });

  test("tenant sentinel becomes auth.active_tenant_id() with ::text cast", () => {
    expect(objToSql({ tenant_id: TENANT_SENTINEL }, "p")).toBe(
      "p.tenant_id::text = auth.active_tenant_id()",
    );
  });
});

describe("objToSql boolean combinators", () => {
  test("OR joins branches", () => {
    expect(objToSql({ OR: [{ published: true }, { id: "x" }] }, "p")).toBe(
      "( p.published = true\n    OR p.id = 'x' )",
    );
  });

  test("AND joins branches", () => {
    expect(objToSql({ AND: [{ published: true }, { id: "x" }] }, "p")).toBe(
      "( p.published = true\n    AND p.id = 'x' )",
    );
  });

  test("empty OR denies, empty AND permits", () => {
    expect(objToSql({ OR: [] }, "p")).toBe("false");
    expect(objToSql({ AND: [] }, "p")).toBe("true");
  });

  test("multi-key object is implicit AND", () => {
    expect(objToSql({ published: true, id: "x" }, "p")).toBe(
      "p.published = true\n    AND p.id = 'x'",
    );
  });
});

describe("objToSql array / in / notIn", () => {
  test("array shorthand is = ANY", () => {
    expect(objToSql({ id: ["a", "b"] }, "p")).toBe(
      "p.id = ANY(ARRAY['a', 'b'])",
    );
  });

  test("in operator on scalar field", () => {
    expect(objToSql({ tenant_id: { in: ["a", "b"] } }, "p", "projects")).toBe(
      "p.tenant_id = ANY(ARRAY['a', 'b'])",
    );
  });

  test("notIn negates", () => {
    expect(objToSql({ tenant_id: { notIn: ["a"] } }, "p", "projects")).toBe(
      "NOT (p.tenant_id = ANY(ARRAY['a']))",
    );
  });

  test("array containing auth sentinel casts column to ::text", () => {
    expect(objToSql({ tenant_id: { in: [TENANT_SENTINEL] } }, "p", "projects")).toBe(
      "p.tenant_id::text = ANY(ARRAY[auth.active_tenant_id()])",
    );
  });

  test("unsupported scalar operator throws", () => {
    expect(() => objToSql({ tenant_id: { weird: 1 } }, "p", "projects")).toThrow(
      /Unsupported filter/,
    );
  });
});

describe("objToSql scalar comparison operators", () => {
  test("equals operator form", () => {
    expect(objToSql({ name: { equals: "x" } }, "p", "projects")).toBe(
      "p.name = 'x'",
    );
  });

  test("equals null is IS NULL", () => {
    expect(objToSql({ name: { equals: null } }, "p", "projects")).toBe(
      "p.name IS NULL",
    );
  });

  test("not value uses IS DISTINCT FROM", () => {
    expect(objToSql({ name: { not: "x" } }, "p", "projects")).toBe(
      "p.name IS DISTINCT FROM 'x'",
    );
  });

  test("not null is IS NOT NULL", () => {
    expect(objToSql({ name: { not: null } }, "p", "projects")).toBe(
      "p.name IS NOT NULL",
    );
  });

  test("not nested filter negates", () => {
    expect(objToSql({ name: { not: { contains: "x" } } }, "p", "projects")).toBe(
      "NOT (p.name LIKE '%x%')",
    );
  });

  test("lt lte gt gte", () => {
    expect(objToSql({ age: { gte: 18 } }, "p", "projects")).toBe("p.age >= 18");
    expect(objToSql({ age: { lt: 65 } }, "p", "projects")).toBe("p.age < 65");
    expect(objToSql({ age: { gt: 0 } }, "p", "projects")).toBe("p.age > 0");
    expect(objToSql({ age: { lte: 9 } }, "p", "projects")).toBe("p.age <= 9");
  });

  test("multiple operators on one field AND-join", () => {
    expect(objToSql({ age: { gte: 18, lt: 65 } }, "p", "projects")).toBe(
      "(p.age >= 18 AND p.age < 65)",
    );
  });
});

describe("objToSql string LIKE operators", () => {
  test("contains / startsWith / endsWith", () => {
    expect(objToSql({ name: { contains: "ab" } }, "p", "projects")).toBe(
      "p.name LIKE '%ab%'",
    );
    expect(objToSql({ name: { startsWith: "ab" } }, "p", "projects")).toBe(
      "p.name LIKE 'ab%'",
    );
    expect(objToSql({ name: { endsWith: "ab" } }, "p", "projects")).toBe(
      "p.name LIKE '%ab'",
    );
  });

  test("mode insensitive switches LIKE to ILIKE", () => {
    expect(
      objToSql({ name: { contains: "ab", mode: "insensitive" } }, "p", "projects"),
    ).toBe("p.name ILIKE '%ab%'");
  });

  test("insensitive equals lowercases both sides", () => {
    expect(
      objToSql({ name: { equals: "AB", mode: "insensitive" } }, "p", "projects"),
    ).toBe("LOWER(p.name) = LOWER('AB')");
  });

  test("escapes LIKE wildcards and quotes in the pattern", () => {
    expect(objToSql({ name: { contains: "a%_'" } }, "p", "projects")).toBe(
      "p.name LIKE '%a\\%\\_''%'",
    );
  });
});

describe("objToSql NOT combinator", () => {
  test("NOT of a single filter", () => {
    expect(objToSql({ NOT: { published: true } }, "p", "projects")).toBe(
      "NOT (p.published = true)",
    );
  });

  test("NOT of an array negates the OR of its members", () => {
    expect(
      objToSql({ NOT: [{ published: true }, { id: "x" }] }, "p", "projects"),
    ).toBe("NOT ( p.published = true\n    OR p.id = 'x' )");
  });
});

describe("objToSql relation isNot", () => {
  test("to-one isNot is NOT EXISTS", () => {
    expect(objToSql({ owner: { isNot: { id: "x" } } }, "p", "projects")).toBe(
      "NOT EXISTS (SELECT 1 FROM users owner WHERE owner.id = p.owner_id AND owner.id = 'x')",
    );
  });
});

describe("objToSql relation null checks", () => {
  test("is null means no related row", () => {
    expect(objToSql({ owner: { is: null } }, "p", "projects")).toBe(
      "NOT EXISTS (SELECT 1 FROM users owner WHERE owner.id = p.owner_id)",
    );
  });

  test("isNot null means a related row exists", () => {
    expect(objToSql({ owner: { isNot: null } }, "p", "projects")).toBe(
      "EXISTS (SELECT 1 FROM users owner WHERE owner.id = p.owner_id)",
    );
  });

  test("bare relation null means no related row", () => {
    expect(objToSql({ owner: null }, "p", "projects")).toBe(
      "NOT EXISTS (SELECT 1 FROM users owner WHERE owner.id = p.owner_id)",
    );
  });

  test("scalar null is still a column IS NULL check", () => {
    expect(objToSql({ tenant_id: null }, "p", "projects")).toBe(
      "p.tenant_id IS NULL",
    );
  });
});

describe("objToSql scalar-array operators", () => {
  test("has membership", () => {
    expect(objToSql({ tags: { has: "x" } }, "p", "projects")).toBe(
      "'x' = ANY(p.tags)",
    );
  });

  test("hasEvery containment", () => {
    expect(objToSql({ tags: { hasEvery: ["a", "b"] } }, "p", "projects")).toBe(
      "p.tags @> ARRAY['a', 'b']",
    );
  });

  test("hasSome overlap", () => {
    expect(objToSql({ tags: { hasSome: ["a", "b"] } }, "p", "projects")).toBe(
      "p.tags && ARRAY['a', 'b']",
    );
  });

  test("isEmpty", () => {
    expect(objToSql({ tags: { isEmpty: true } }, "p", "projects")).toBe(
      "cardinality(p.tags) = 0",
    );
    expect(objToSql({ tags: { isEmpty: false } }, "p", "projects")).toBe(
      "cardinality(p.tags) <> 0",
    );
  });
});

describe("objToSql mixed combinator predicate", () => {
  test("OR of comparison + insensitive LIKE, AND-joined with a NOT", () => {
    expect(
      objToSql(
        {
          OR: [{ age: { gte: 18 } }, { name: { contains: "a", mode: "insensitive" } }],
          NOT: { published: true },
        },
        "p",
        "projects",
      ),
    ).toBe(
      "( p.age >= 18\n    OR p.name ILIKE '%a%' )\n    AND NOT (p.published = true)",
    );
  });
});

describe("objToSql relation traversal", () => {
  test("parent traversal via bare relation object", () => {
    expect(objToSql({ owner: { id: "x" } }, "p", "projects")).toBe(
      "EXISTS (SELECT 1 FROM users owner WHERE owner.id = p.owner_id AND owner.id = 'x')",
    );
  });

  test("parent traversal via explicit is", () => {
    expect(objToSql({ owner: { is: { id: "x" } } }, "p", "projects")).toBe(
      "EXISTS (SELECT 1 FROM users owner WHERE owner.id = p.owner_id AND owner.id = 'x')",
    );
  });

  test("child traversal via some resolves inverse fk", () => {
    expect(
      objToSql({ tasks: { some: { id: "x" } } }, "p", "projects"),
    ).toBe(
      "EXISTS (SELECT 1 FROM tasks tasks WHERE tasks.project_id = p.id AND tasks.id = 'x')",
    );
  });

  test("none negates the existence check", () => {
    expect(
      objToSql({ tasks: { none: { id: "x" } } }, "p", "projects"),
    ).toBe(
      "NOT EXISTS (SELECT 1 FROM tasks tasks WHERE tasks.project_id = p.id AND tasks.id = 'x')",
    );
  });

  test("every asserts no child violates the predicate", () => {
    expect(
      objToSql({ tasks: { every: { id: "x" } } }, "p", "projects"),
    ).toBe(
      "NOT EXISTS (SELECT 1 FROM tasks tasks WHERE tasks.project_id = p.id AND NOT (tasks.id = 'x'))",
    );
  });

  test("two-level parent join nests EXISTS subqueries", () => {
    expect(
      objToSql({ owner: { manager: { id: "x" } } }, "p", "projects"),
    ).toBe(
      "EXISTS (SELECT 1 FROM users owner WHERE owner.id = p.owner_id AND " +
        "EXISTS (SELECT 1 FROM users manager WHERE manager.id = owner.manager_id AND manager.id = 'x'))",
    );
  });
});

describe("resolveAuth", () => {
  test("calls function with sentinel context", () => {
    expect(resolveAuth((a: { tenantId: string }) => ({ tenant_id: a.tenantId }))).toEqual({
      tenant_id: TENANT_SENTINEL,
    });
  });

  test("a throwing predicate resolves to deny", () => {
    expect(
      resolveAuth(() => {
        throw new Error("no");
      }),
    ).toBe(false);
  });

  test("non-function value passes through", () => {
    expect(resolveAuth({ published: true })).toEqual({ published: true });
    expect(resolveAuth(true)).toBe(true);
  });
});

describe("authGuard", () => {
  test("false denies outright", () => {
    expect(authGuard(false, "p")).toBe("false");
  });

  test("true requires an authenticated user", () => {
    expect(authGuard(true, "p")).toBe("auth.user_id() IS NOT NULL");
  });

  test("object predicate is wrapped with the auth guard", () => {
    expect(authGuard({ tenant_id: TENANT_SENTINEL }, "p", "projects")).toBe(
      "(auth.user_id() IS NOT NULL AND p.tenant_id::text = auth.active_tenant_id())",
    );
  });
});
