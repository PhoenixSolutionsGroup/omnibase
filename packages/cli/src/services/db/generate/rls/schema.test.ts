import { test, expect, describe, beforeEach } from "bun:test";
import type { BaseDMMF } from "@prisma/client/runtime/library";
import {
  loadSchema,
  hasModel,
  lookupField,
  resolveParentFk,
  resolveChildFk,
  resolveTableName,
} from "./schema";

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
        name: "Project",
        dbName: "projects",
        fields: [
          scalar("id"),
          relation("owner", "User", "ProjectOwner", ["owner_id"]),
          relation("tasks", "Task", "ProjectTasks", []),
        ],
      },
      { name: "User", dbName: null, fields: [scalar("id")] },
      {
        name: "Task",
        dbName: "tasks",
        fields: [
          scalar("id"),
          relation("project", "Project", "ProjectTasks", ["project_id"]),
        ],
      },
    ],
  },
} as unknown as BaseDMMF;

beforeEach(() => loadSchema(dmmf));

describe("resolveTableName", () => {
  test("uses dbName mapping when present", () => {
    expect(resolveTableName("Project")).toBe("projects");
  });

  test("falls back to model name when dbName is null", () => {
    expect(resolveTableName("User")).toBe("User");
  });

  test("is case-insensitive on the model key", () => {
    expect(resolveTableName("project")).toBe("projects");
  });

  test("passes unknown models through unchanged", () => {
    expect(resolveTableName("Nope")).toBe("Nope");
  });
});

describe("hasModel", () => {
  test("reports known and unknown models", () => {
    expect(hasModel("Project")).toBe(true);
    expect(hasModel("Nope")).toBe(false);
  });
});

describe("lookupField", () => {
  test("returns the field definition", () => {
    expect(lookupField("Project", "id").name).toBe("id");
  });

  test("throws on unknown model", () => {
    expect(() => lookupField("Nope", "id")).toThrow(/Model "Nope" not found/);
  });

  test("throws on unknown field", () => {
    expect(() => lookupField("Project", "nope")).toThrow(
      /Field "nope" not found/,
    );
  });
});

describe("resolveParentFk", () => {
  test("returns the FK column on the owning side", () => {
    expect(resolveParentFk("Project", "owner")).toBe("owner_id");
  });

  test("throws when the field is not a relation", () => {
    expect(() => resolveParentFk("Project", "id")).toThrow(/not a relation/);
  });

  test("throws on a list relation that has no FK on this side", () => {
    expect(() => resolveParentFk("Project", "tasks")).toThrow(
      /list relation/,
    );
  });
});

describe("resolveChildFk", () => {
  test("resolves the inverse relation FK on the child model", () => {
    expect(resolveChildFk("Project", "tasks")).toBe("project_id");
  });

  test("throws when the field is not a relation", () => {
    expect(() => resolveChildFk("Project", "id")).toThrow(/not a relation/);
  });
});
