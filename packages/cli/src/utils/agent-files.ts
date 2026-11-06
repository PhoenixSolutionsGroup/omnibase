import * as fs from "fs";
import * as path from "path";

const POINTER = "omnibase/AGENTS.md";

const POINTER_SECTION = [
  "## OmniBase",
  "",
  "This project uses OmniBase for authentication, multi-tenancy, permissions, storage, payments, email, and edge workers.",
  `Read \`${POINTER}\` before changing OmniBase configuration or using its APIs, and run \`omnibase docs\` for current guides and API references.`,
  "",
].join("\n");

export function writeAgentPointers(targetDir: string): void {
  const agentsPath = path.join(targetDir, "AGENTS.md");
  const claudePath = path.join(targetDir, "CLAUDE.md");
  const hasAgents = fs.existsSync(agentsPath);
  const hasClaude = fs.existsSync(claudePath);

  if (!hasAgents && !hasClaude) {
    fs.writeFileSync(agentsPath, `# AGENTS.md\n\n${POINTER_SECTION}`);
    return;
  }

  if (hasAgents) {
    const content = fs.readFileSync(agentsPath, "utf-8");
    if (!content.includes(POINTER)) {
      fs.appendFileSync(agentsPath, `\n${POINTER_SECTION}`);
    }
  }

  if (hasClaude) {
    const content = fs.readFileSync(claudePath, "utf-8");
    const importsRootAgents = /(^|\n)\s*@AGENTS\.md\b/.test(content);
    if (!content.includes(POINTER) && !(hasAgents && importsRootAgents)) {
      fs.appendFileSync(claudePath, `\n@${POINTER}\n`);
    }
  }
}
