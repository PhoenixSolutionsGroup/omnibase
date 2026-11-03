import { describe, expect, test } from "bun:test";
import { CONTROL_PLANE_SERVICES, formatStartSummary } from "./start-summary";

describe("formatStartSummary", () => {
  test("lists control-plane services followed by deployments", () => {
    const lines = formatStartSummary([
      { name: "dashboard", url: "http://localhost:8787" },
    ]);

    expect(lines).toHaveLength(CONTROL_PLANE_SERVICES.length + 1);
    expect(lines[0]).toContain("Omnibase API:");
    expect(lines[0]).toContain("http://localhost:8080");
    expect(lines[lines.length - 1]).toContain("dashboard:");
    expect(lines[lines.length - 1]).toContain("http://localhost:8787");
  });

  test("aligns urls into one column", () => {
    const entries = [
      ...CONTROL_PLANE_SERVICES,
      { name: "a-very-long-deployment-name", url: "http://localhost:8787" },
    ];
    const lines = formatStartSummary([entries[entries.length - 1]]);
    const columns = new Set(lines.map((line, i) => line.indexOf(entries[i].url)));
    expect(columns.size).toBe(1);
  });

  test("works with no deployments", () => {
    expect(formatStartSummary([])).toHaveLength(CONTROL_PLANE_SERVICES.length);
  });
});
