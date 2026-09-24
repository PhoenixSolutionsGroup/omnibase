import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { spawnSync, execSync } from "child_process";
import { config as dotenvConfig } from "dotenv";
import {
  findOmnibaseRoot,
  getProjectName,
  EnvironmentConfig,
} from "./environment";
import {
  loadConfig,
  loadSecretsMap,
  interpolateValue,
  localEnvFromConfig,
  assertValidVersions,
  OmnibaseConfig,
} from "./config";

const VERSION_REPOS: Record<string, string> = {
  auth: "phoenixsolutionsgroup/omnibase-auth",
  api: "phoenixsolutionsgroup/omnibase-api",
  perm: "phoenixsolutionsgroup/omnibase-permissions",
};

const VERSION_COMPOSE_SERVICES: Record<string, string[]> = {
  auth: ["auth", "auth-migrate"],
  api: ["rest-api"],
  perm: ["permissions", "permissions-migrate"],
};

/**
 * Fail fast if a [versions] tag doesn't exist on the registry, before
 * `docker compose up` starts pulling. Uses `docker manifest inspect` so the
 * real registry (with Docker's auth/rate-limit handling) answers, not a
 * hand-rolled HTTP call. Network/daemon errors warn and continue — the
 * compose pull will surface the real failure.
 */
function verifyVersionsExist(versions: Record<string, string>): void {
  const missing: string[] = [];
  for (const [svc, ver] of Object.entries(versions)) {
    const repo = VERSION_REPOS[svc];
    if (!repo) continue;
    try {
      execSync(`docker manifest inspect ${repo}:${ver}`, { stdio: "ignore" });
    } catch {
      missing.push(`${svc}=${ver}`);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `[versions] tag(s) not found on Docker Hub: ${missing.join(", ")}`,
    );
  }
}

/**
 * Build a small override compose file pinning the image tags for the services
 * declared under [versions]. Returned path is appended to the compose file
 * list so later files win. Returns null when there is nothing to override.
 */
export function buildVersionsOverrideCompose(
  projectRoot: string,
  versions: Record<string, string>,
): string | null {
  const entries: string[] = [];
  for (const svc of Object.keys(versions)) {
    const repo = VERSION_REPOS[svc];
    const composeServices = VERSION_COMPOSE_SERVICES[svc] ?? [];
    if (!repo || composeServices.length === 0) continue;
    for (const name of composeServices) {
      entries.push(`  ${name}:`, `    image: ${repo}:${versions[svc]}`);
    }
  }
  if (entries.length === 0) return null;

  const body = ["services:", ...entries, ""].join("\n");
  const overridePath = path.join(
    os.tmpdir(),
    `omnibase-${path.basename(projectRoot)}-versions.yaml`,
  );
  fs.writeFileSync(overridePath, body);
  return overridePath;
}

/**
 * Get the path to the CLI's docker directory
 */
export function getDockerDir(): string {
  return path.join(__dirname, "..", "..", "docker");
}

/**
 * Get the list of compose files for a given mode
 */
export function getComposeFiles(mode?: string): string[] {
  const dockerDir = getDockerDir();
  const baseFile = path.join(dockerDir, "docker-compose.base.yml");

  const files = [baseFile];

  if (mode === "dev") {
    files.push(path.join(dockerDir, "docker-compose.dev.yml"));
  } else if (mode === "test") {
    files.push(path.join(dockerDir, "docker-compose.test.yml"));
  } else if (mode === "perf-test") {
    files.push(path.join(dockerDir, "docker-compose.perf-test.yml"));
  } else {
    // No mode specified - use local compose with persistent volumes
    files.push(path.join(dockerDir, "docker-compose.local.yml"));
  }

  return files;
}

/**
 * Validate that all compose files exist
 */
export function validateComposeFiles(files: string[]): void {
  for (const file of files) {
    if (!fs.existsSync(file)) {
      throw new Error(
        `Compose file not found at: ${file}\nMake sure you're in a valid omnibase project directory.`,
      );
    }
  }
}

export interface DockerComposeOptions {
  mode?: string;
  envConfig: EnvironmentConfig;
  stdio?: "inherit" | "ignore" | "pipe";
}

/**
 * Build the env file handed to docker compose.
 *
 * The local env file supplies secrets and machine-specific values; anything
 * declared in omnibase.toml is layered on top so the same config drives local
 * containers and cloud deployments. {VAR} resolves from process.env then the
 * env file — for local dev that file is .env.local, which is exactly where
 * dev-only secrets belong.
 *
 * The original file's text is copied verbatim and the derived values appended,
 * so multi-line values (JWKS blobs and the like) survive untouched and the
 * later definitions win.
 *
 * Returns the original env file path when omnibase.toml contributes nothing,
 * so projects without a toml behave as before.
 */
export function buildEffectiveEnvFile(envName: string): string {
  const root = findOmnibaseRoot();
  const config = loadConfig(root);
  const branchEnvPath = path.join(root, "omnibase", `.env.${envName}`);
  const envPath =
    envName && envName !== "local" && fs.existsSync(branchEnvPath)
      ? branchEnvPath
      : path.join(root, "omnibase", ".env.local");

  const fileText = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf-8")
    : "";

  const secrets = loadSecretsMap(root, envName, config.local?.env_path);
  const resolved = interpolateValue(config, secrets) as OmnibaseConfig;
  const derived = localEnvFromConfig(resolved);

  if (Object.keys(derived).length === 0) {
    return envPath;
  }

  const appended = Object.entries(derived)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  const body =
    (fileText.endsWith("\n") || fileText === "" ? fileText : fileText + "\n") +
    "\n# --- derived from omnibase.toml (overrides the above) ---\n" +
    appended +
    "\n";

  const effectivePath = path.join(
    os.tmpdir(),
    `omnibase-${getProjectName()}-${envName}.env`
  );
  fs.writeFileSync(effectivePath, body, { mode: 0o600 });

  return effectivePath;
}

/**
 * Run a docker compose command with the correct compose files and environment
 */
export function runDockerComposeCommand(
  command: string,
  services: string[],
  options: DockerComposeOptions,
): void {
  const projectRoot = findOmnibaseRoot();
  const projectName = getProjectName();
  const composeFiles = getComposeFiles(options.mode);

  validateComposeFiles(composeFiles);

  const config = loadConfig(projectRoot);
  if (config.versions && Object.keys(config.versions).length > 0 && options.mode !== "dev") {
    assertValidVersions(config.versions);
    verifyVersionsExist(config.versions);
    const override = buildVersionsOverrideCompose(projectRoot, config.versions);
    if (override) composeFiles.push(override);
  }

  const envPath = buildEffectiveEnvFile(options.envConfig.name);

  const composeArgs = composeFiles.flatMap((f) => ["-f", f]);
  const serviceArgs = services.length > 0 ? services : [];

  const commandParts = command.split(/\s+/);
  const cmdArgs = [
    "compose",
    "--project-name",
    projectName,
    ...composeArgs,
    "--env-file",
    envPath,
    ...commandParts,
    ...serviceArgs,
  ];

  const result = spawnSync("docker", cmdArgs, {
    stdio: options.stdio || "inherit",
    cwd: projectRoot,
    env: {
      ...process.env,
      OMNIBASE_PROJECT_DIR: projectRoot,
      OMNIBASE_ENV_FILE: envPath,
    },
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: docker ${cmdArgs.join(" ")}`);
  }
}

/**
 * Run a command inside a running docker compose service
 */
export function composeExec(
  service: string,
  cmd: string[],
  options: DockerComposeOptions,
): void {
  const projectRoot = findOmnibaseRoot();
  const projectName = getProjectName();
  const composeFiles = getComposeFiles(options.mode);

  validateComposeFiles(composeFiles);

  const envPath = buildEffectiveEnvFile(options.envConfig.name);
  const composeArgs = composeFiles.flatMap((f) => ["-f", f]);
  const cmdArgs = [
    "compose",
    "--project-name",
    projectName,
    ...composeArgs,
    "--env-file",
    envPath,
    "exec",
    "-T",
    service,
    ...cmd,
  ];

  const result = spawnSync("docker", cmdArgs, {
    stdio: options.stdio || "inherit",
    cwd: projectRoot,
    env: {
      ...process.env,
      OMNIBASE_PROJECT_DIR: projectRoot,
      OMNIBASE_ENV_FILE: envPath,
    },
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: docker ${cmdArgs.join(" ")}`);
  }
}

/**
 * Restart a docker service
 */
export async function restartDockerService(
  service: string,
  options: DockerComposeOptions,
): Promise<boolean> {
  try {
    runDockerComposeCommand("restart", [service], options);
    return true;
  } catch (error: any) {
    return false;
  }
}
