import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeAgentPointers } from "./agent-files";

const dirs: string[] = [];

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "omnibase-agents-"));
  dirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of dirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("writeAgentPointers", () => {
  test("creates a root AGENTS.md when no agent files exist", () => {
    const dir = tempDir();

    writeAgentPointers(dir);

    const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    expect(content).toContain("omnibase/AGENTS.md");
  });

  test("appends the pointer to an existing AGENTS.md only once", () => {
    const dir = tempDir();
    writeFileSync(join(dir, "AGENTS.md"), "# Existing agents\n");

    writeAgentPointers(dir);
    writeAgentPointers(dir);

    const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    expect(content).toContain("# Existing agents");
    expect(content.split("omnibase/AGENTS.md").length - 1).toBe(1);
  });

  test("imports omnibase/AGENTS.md from an existing CLAUDE.md", () => {
    const dir = tempDir();
    writeFileSync(join(dir, "CLAUDE.md"), "# Claude\n");

    writeAgentPointers(dir);

    const content = readFileSync(join(dir, "CLAUDE.md"), "utf-8");
    expect(content).toContain("@omnibase/AGENTS.md");
  });

  test("relies on the root AGENTS.md import when CLAUDE.md already imports it", () => {
    const dir = tempDir();
    writeFileSync(join(dir, "AGENTS.md"), "# Existing agents\n");
    writeFileSync(join(dir, "CLAUDE.md"), "@AGENTS.md\n");

    writeAgentPointers(dir);

    const content = readFileSync(join(dir, "CLAUDE.md"), "utf-8");
    expect(content).toBe("@AGENTS.md\n");
  });
});
