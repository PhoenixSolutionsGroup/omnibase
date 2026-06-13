import { test, expect, describe } from "bun:test";
import {
  resolveAppliedMigrations,
  rollbackTargets,
  rollbackSteps,
  ROLLBACK_ALL,
  type MigrationEntry,
} from "./migrate";

const entries = (...versions: number[]): MigrationEntry[] =>
  versions.map((v) => ({ dir: `${v}_m`, version: v }));

describe("resolveAppliedMigrations", () => {
  test("keeps only dirs at or below current version, ascending", () => {
    const applied = resolveAppliedMigrations(
      ["300_c", "100_a", "200_b"],
      200,
    );
    expect(applied.map((e) => e.dir)).toEqual(["100_a", "200_b"]);
  });

  test("includes the dir exactly equal to current version", () => {
    const applied = resolveAppliedMigrations(["100_a"], 100);
    expect(applied.map((e) => e.dir)).toEqual(["100_a"]);
  });

  test("does not mutate the caller's array", () => {
    const dirs = ["300_c", "100_a"];
    resolveAppliedMigrations(dirs, 999);
    expect(dirs).toEqual(["300_c", "100_a"]);
  });

  test("skips dirs without a numeric version prefix", () => {
    const applied = resolveAppliedMigrations(["bogus", "100_a"], 999);
    expect(applied.map((e) => e.dir)).toEqual(["100_a"]);
  });

  test("returns empty when nothing is applied", () => {
    expect(resolveAppliedMigrations(["100_a"], 50)).toEqual([]);
  });
});

describe("rollbackTargets", () => {
  test("excludes the current (last) migration, newest-first", () => {
    expect(rollbackTargets(entries(100, 200, 300))).toEqual([
      "200_m",
      "100_m",
    ]);
  });

  test("single applied migration has no roll-back-to target", () => {
    expect(rollbackTargets(entries(100))).toEqual([]);
  });

  test("does not mutate the applied list", () => {
    const applied = entries(100, 200, 300);
    rollbackTargets(applied);
    expect(applied.map((e) => e.dir)).toEqual(["100_m", "200_m", "300_m"]);
  });
});

describe("rollbackSteps", () => {
  test("rollback-all rolls back every applied migration", () => {
    expect(rollbackSteps(entries(100, 200, 300), ROLLBACK_ALL)).toBe(3);
  });

  test("rollback-all on a single migration rolls back that one", () => {
    expect(rollbackSteps(entries(100), ROLLBACK_ALL)).toBe(1);
  });

  test("rolling back to the oldest target undoes everything newer", () => {
    expect(rollbackSteps(entries(100, 200, 300), "100_m")).toBe(2);
  });

  test("rolling back to a middle target undoes only newer ones", () => {
    expect(rollbackSteps(entries(100, 200, 300), "200_m")).toBe(1);
  });

  test("unknown selection yields zero steps", () => {
    expect(rollbackSteps(entries(100, 200), "999_x")).toBe(0);
  });
});
