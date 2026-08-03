import { Command } from "commander";
import { execSync } from "child_process";
import { readFile, readdir } from "fs/promises";
import * as fs from "fs";
import FormData from "form-data";
import JSZip from "jszip";
import * as TOML from "smol-toml";
import axios from "axios";
import { checkbox, select, input } from "@inquirer/prompts";
import * as path from "path";
import { config as dotenvConfig } from "dotenv";
import {
  EnvironmentConfig,
  findOmnibaseRoot,
  selectEnvironment,
} from "../utils/environment";
import {
  loadCredentials,
  saveCredentials,
  getActiveProfile,
  Profile,
} from "../utils/credentials";
import { logger } from "../utils/logger";
import { handleCommandError, formatHttpError } from "../utils/errors";
import { createManagedHostingClient, createProfileClient } from "../utils/api-client";
import {
  loadConfig,
  getResolvedConfig,
  interpolateValue,
  cloudConfigOf,
  DeploymentConfig,
  OmnibaseConfig,
} from "../utils/config";

/**
 * Login to OmniBase Cloud
 */
async function login(
  apiKey: string,
  options: { url?: string; name?: string }
): Promise<void> {
  const managedHostingUrl = options.url || "https://api.omnibase.io";

  logger.start(`Verifying API key with ${managedHostingUrl}...`);

  try {
    const response = await axios.post(
      `${managedHostingUrl}/api/v1/api-keys/verify`,
      {},
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const data = response.data;
    if (!data?.tenant_id) {
      throw new Error("Invalid API key");
    }

    logger.succeed(`Authenticated as ${data.tenant_name} (${data.key_name})`);

    const credentials = loadCredentials();
    const tenantSlug = data.tenant_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    const keySlug = data.key_name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const profileName = options.name || `${tenantSlug}-${keySlug}`;

    const profile: Profile = {
      tenant_id: data.tenant_id,
      tenant_name: data.tenant_name,
      key_name: data.key_name,
      key_prefix: data.key_prefix,
      api_key: apiKey,
      managed_hosting_url: managedHostingUrl,
    };

    credentials.profiles[profileName] = profile;
    credentials.active_profile = profileName;

    saveCredentials(credentials);

    logger.succeed(`Profile '${profileName}' saved and set as active.`);
  } catch (error) {
    await handleCommandError(error);
  }
}

/**
 * Logout from OmniBase Cloud (remove selected profiles)
 */
async function logout(
  options: { all?: boolean },
  profileArg?: string
): Promise<void> {
  const credentials = loadCredentials();
  const profiles = Object.keys(credentials.profiles);

  if (profiles.length === 0) {
    logger.warn("No profiles found.");
    return;
  }

  if (options.all) {
    credentials.profiles = {};
    credentials.active_profile = "";
    saveCredentials(credentials);
    logger.succeed("Logged out from all profiles.");
    return;
  }

  let profilesToRemove: string[];

  if (profileArg) {
    // Single profile specified as argument
    if (!credentials.profiles[profileArg]) {
      logger.fail(`Profile '${profileArg}' not found.`);
      return;
    }
    profilesToRemove = [profileArg];
  } else {
    // Interactive multi-select
    const choices = profiles.map((p) => {
      const profile = credentials.profiles[p];
      const isActive = p === credentials.active_profile;
      return {
        name: `${p} (${profile.tenant_name})${isActive ? " *" : ""}`,
        value: p,
      };
    });

    profilesToRemove = await checkbox({
      message: "Select profiles to logout:",
      choices,
    });

    if (profilesToRemove.length === 0) {
      logger.warn("No profiles selected");
      return;
    }
  }

  // Remove selected profiles
  for (const profileName of profilesToRemove) {
    delete credentials.profiles[profileName];
  }

  // Update active profile if it was removed
  if (profilesToRemove.includes(credentials.active_profile)) {
    const remainingProfiles = Object.keys(credentials.profiles);
    credentials.active_profile = remainingProfiles[0] || "";
  }

  saveCredentials(credentials);

  logger.succeed(
    `Logged out from ${
      profilesToRemove.length
    } profile(s): ${profilesToRemove.join(", ")}`
  );

  if (credentials.active_profile) {
    logger.log(`   Active profile: ${credentials.active_profile}`);
  }
}

/**
 * Switch active profile
 */
async function switchProfile(profileName?: string): Promise<void> {
  const credentials = loadCredentials();
  const profiles = Object.keys(credentials.profiles);

  if (profiles.length === 0) {
    logger.warn("No profiles found. Run 'omnibase cloud login' first.");
    return;
  }

  if (profileName) {
    if (!credentials.profiles[profileName]) {
      logger.fail(`Profile '${profileName}' not found.`);
      logger.log("Available profiles:");
      profiles.forEach((p) => { logger.log(`   - ${p}`); });
      return;
    }

    credentials.active_profile = profileName;
    saveCredentials(credentials);
    logger.succeed(`Switched to profile '${profileName}'`);
    return;
  }

  // Interactive single-select
  const choices = profiles.map((p) => {
    const profile = credentials.profiles[p];
    const isActive = p === credentials.active_profile;
    return {
      name: `${p} (${profile.tenant_name})${isActive ? " - current" : ""}`,
      value: p,
    };
  });

  const selectedProfile = await select({
    message: "Select profile to switch to:",
    choices,
  });

  credentials.active_profile = selectedProfile;
  saveCredentials(credentials);
  logger.succeed(`Switched to profile '${selectedProfile}'`);
}

/**
 * List profiles
 */
async function listProfiles(): Promise<void> {
  const credentials = loadCredentials();
  const profiles = Object.keys(credentials.profiles);

  if (profiles.length === 0) {
    logger.warn("No profiles found.");
    return;
  }

  logger.log("Profiles:");
  profiles.forEach((p) => {
    const profile = credentials.profiles[p];
    const active = p === credentials.active_profile ? "*" : " ";
    logger.log(` [${active}] ${p}`);
    logger.log(`      Tenant: ${profile.tenant_name}`);
    logger.log(`      Key: ${profile.key_name} (${profile.key_prefix}...)`);
  });
}

/**
 * Get deployments from config or fall back to legacy single-worker dir
 */
function getDeployments(root: string): DeploymentConfig[] {
  const config = loadConfig(root);
  if (config.deployments.length > 0) return config.deployments;

  const legacyWorkersDir = path.join(root, "omnibase", "workers");
  if (fs.existsSync(legacyWorkersDir)) {
    return [{ name: "default", path: "workers" }];
  }

  throw new Error(
    "No deployments found. Add [[deployments]] to omnibase/omnibase.toml\n" +
      "  or create omnibase/workers/ for the default deployment.",
  );
}

/**
 * Deploy workers to Cloudflare via managed hosting
 */
async function deployWorkers(
  envFlag?: string,
  nameFlag?: string,
  allFlag?: boolean,
): Promise<void> {
  const root = findOmnibaseRoot();

  const env = await selectEnvironment(envFlag);

  if (env.name === "local") {
    logger.warn("Workers deployment is not available for local environment.");
    logger.log("Use --env flag to specify a cloud environment:");
    logger.log("   omnibase cloud workers deploy --env dev");
    logger.log("   omnibase cloud workers deploy --env staging");
    logger.log("   omnibase cloud workers deploy --env production");
    return;
  }

  if (!env.branchId) {
    throw new Error(
      `No branch ID resolved for environment '${env.name}'.\n` +
        `Ensure your branch has finished provisioning.`
    );
  }

  if (!env.managedHostingApiUrl) {
    throw new Error(
      `No managed hosting URL resolved for environment '${env.name}'.\n` +
        `Ensure your profile is configured: 'omnibase cloud login'`
    );
  }

  const deployments = getDeployments(root);
  let targets: DeploymentConfig[];

  if (nameFlag) {
    const match = deployments.find((d) => d.name === nameFlag);
    if (!match) {
      throw new Error(
        `Deployment '${nameFlag}' not found.\n` +
          `Available deployments: ${deployments.map((d) => d.name).join(", ")}`
      );
    }
    targets = [match];
  } else if (allFlag) {
    targets = deployments;
  } else if (deployments.length === 1) {
    targets = deployments;
  } else {
    const selected = await select({
      message: "Select deployment to deploy:",
      choices: deployments.map((d) => ({ name: d.name, value: d })),
    });
    targets = [selected];
  }

  for (const dep of targets) {
    const workersDir = path.join(root, "omnibase", dep.path ?? dep.name);

    if (!fs.existsSync(workersDir)) {
      logger.fail(`Deployment '${dep.name}' directory not found: ${workersDir}`);
      continue;
    }

    logger.start(`Building '${dep.name}' for ${env.name}...`);

    try {
      execSync("bunx wrangler deploy --dry-run --outdir .bundle", {
        cwd: workersDir,
        stdio: "inherit",
      });
    } catch (error) {
      logger.fail(`Build failed for '${dep.name}'. Check the output above.`);
      continue;
    }

    const bundle = await packageWorkerBundle(workersDir);
    logger.succeed(`${dep.name}: packaged (${(bundle.length / 1024).toFixed(1)} KB)`);

    logger.start(`Deploying '${dep.name}'...`);
    try {
      const result = await uploadToManagedHosting(env, bundle, dep.name);
      logger.succeed(`${dep.name} deployed`);
      logger.log(`   URL: ${result.url}`);
    } catch (error) {
      logger.fail(`${dep.name} deploy failed: ${formatHttpError(error)}`);
    }
  }
}

/**
 * Turn a `wrangler deploy --dry-run --outdir .bundle` output into a
 * self-contained, deploy-ready zip the managed-hosting server hands to
 * `wrangler deploy --dispatch-namespace`. Framework-agnostic: everything is
 * derived from the project's own wrangler config.
 */
async function packageWorkerBundle(workersDir: string): Promise<Buffer> {
  const config = await loadWranglerConfig(workersDir);
  delete config.build;
  delete config.name;
  config.main = "worker.js";

  const zip = new JSZip();
  await addDirToZip(zip, path.join(workersDir, ".bundle"), (name) =>
    name.endsWith(".map")
  );

  const assetsDir = config.assets?.directory;
  if (assetsDir) {
    config.assets = { ...config.assets, directory: "assets" };
    await addDirToZip(zip.folder("assets")!, path.join(workersDir, assetsDir));
  }

  zip.file("wrangler.json", JSON.stringify(config, null, 2));

  return zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
}

async function loadWranglerConfig(workersDir: string): Promise<any> {
  const parsers: Record<string, (text: string) => any> = {
    "wrangler.jsonc": stripJsonc,
    "wrangler.json": stripJsonc,
    "wrangler.toml": parseToml,
  };
  for (const [name, parse] of Object.entries(parsers)) {
    const p = path.join(workersDir, name);
    try {
      return parse(await readFile(p, "utf-8"));
    } catch (error: any) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  throw new Error(
    "No wrangler.jsonc, wrangler.json, or wrangler.toml found in omnibase/workers."
  );
}

function parseToml(text: string): any {
  return TOML.parse(text);
}

function stripJsonc(text: string): any {
  const noComments = text
    .replace(/\\"|"(?:\\"|[^"])*"|(\/\/[^\n\r]*|\/\*[\s\S]*?\*\/)/g, (m, comment) =>
      comment ? "" : m
    )
    .replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(noComments);
}

async function addDirToZip(
  folder: JSZip,
  dir: string,
  skip?: (name: string) => boolean
): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await addDirToZip(folder.folder(entry.name)!, full, skip);
    } else if (entry.isFile()) {
      if (skip?.(entry.name)) continue;
      folder.file(entry.name, await readFile(full));
    }
  }
}

async function uploadToManagedHosting(
  env: EnvironmentConfig,
  bundle: Buffer,
  deploymentName: string = "default",
) {
  const api = createManagedHostingClient(env);
  const form = new FormData();
  form.append("bundle", bundle, {
    filename: "bundle.zip",
    contentType: "application/zip",
  });

  try {
    const response = await api.post(
      `/api/v1/project_branches/${env.branchId}/workers/${encodeURIComponent(deploymentName)}/deploy`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(formatHttpError(error));
  }
}

interface BranchSummary {
  id: string;
  name: string;
  slug: string;
  status: string;
}

/**
 * Resolve a branch for the project from managed hosting. A `--env` value
 * matches by name, slug, or id; otherwise a single branch is auto-selected or
 * the user is prompted.
 */
async function resolveBranch(
  managedHostingUrl: string,
  projectId: string,
  branchFlag?: string
): Promise<BranchSummary> {
  const api = createManagedHostingClient({
    name: branchFlag || "cloud",
    managedHostingApiUrl: managedHostingUrl,
  } as EnvironmentConfig);

  const { data } = await api.get<BranchSummary[]>(
    `/api/v1/projects/${projectId}/branches`
  );
  const branches = data ?? [];
  if (branches.length === 0) {
    throw new Error(`No branches found for project ${projectId}`);
  }

  if (branchFlag) {
    const found = branches.find(
      (b) =>
        b.name === branchFlag || b.slug === branchFlag || b.id === branchFlag
    );
    if (!found) {
      throw new Error(
        `Branch '${branchFlag}' not found. Available: ${branches
          .map((b) => b.name)
          .join(", ")}`
      );
    }
    return found;
  }

  if (branches.length === 1) return branches[0];

  const id = await select({
    message: "Select branch:",
    choices: branches.map((b) => ({
      name: `${b.name} (${b.status})`,
      value: b.id,
    })),
  });
  return branches.find((b) => b.id === id)!;
}

/**
 * Push config from omnibase.toml to managed hosting.
 *
 * Everything except [local] is sent; managed hosting maps what it understands
 * and reports the rest. [local] stays on this machine — that is where Stripe
 * lives, since managed hosting owns Stripe env via the Connect account it
 * provisions per branch.
 *
 * {VAR} secrets resolve from process.env, then an optional --from-env file.
 * .env.local is NEVER read here — it is strictly for local dev (omnibase start).
 */
export async function pushEnvConfig(
  envFlag?: string,
  fromEnvPath?: string
): Promise<void> {
  const root = findOmnibaseRoot();
  const env = await selectEnvironment(envFlag);

  if (env.name === "local") {
    logger.warn("Environment push is not available for the local environment.");
    logger.log("   omnibase cloud env push --env <branch>");
    return;
  }

  if (!env.branchId) {
    throw new Error(
      `No branch ID resolved for environment '${env.name}'.\n` +
        `Ensure your branch has finished provisioning.`
    );
  }

  if (!env.managedHostingApiUrl) {
    throw new Error(
      `No managed hosting URL resolved for environment '${env.name}'.\n` +
        `Ensure your profile is configured: 'omnibase cloud login'`
    );
  }

  const config = loadConfig(root);
  if (!config.project_id) {
    throw new Error(
      "project_id is required in omnibase/omnibase.toml for cloud env push."
    );
  }

  // Cloud resolution is process.env then --from-env; .env.local is local-only.
  const secrets: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined) secrets[k] = v;
  }
  if (fromEnvPath) {
    const resolvedPath = path.resolve(fromEnvPath);
    const parsed = dotenvConfig({ path: resolvedPath }).parsed;
    if (!parsed) {
      throw new Error(`--from-env file not found or empty: ${resolvedPath}`);
    }
    for (const [k, v] of Object.entries(parsed)) {
      if (!(k in secrets)) secrets[k] = v;
    }
  }

  const resolved = interpolateValue(config, secrets) as OmnibaseConfig;
  const payload = cloudConfigOf(resolved);
  const sections = Object.keys(payload);
  if (sections.length === 0) {
    logger.info("Nothing to push: omnibase.toml has no cloud config sections.");
    return;
  }

  const unresolved = [
    ...new Set(JSON.stringify(payload).match(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g) ?? []),
  ];
  if (unresolved.length > 0) {
    logger.warn(
      `Unresolved ${unresolved.join(", ")} left literal. ` +
        `Set them in process.env or pass --from-env <file>.`
    );
  }

  logger.start(
    `Applying config (${sections.join(", ")}) to branch ${env.name}...`
  );

  const api = createManagedHostingClient(env);

  try {
    const response = await api.post<{
      message: string;
      applied: string[];
      ignored: string[];
    }>(`/api/v1/project_branches/${env.branchId}/env/config`, payload);

    const result = response.data;
    if (result.applied && result.applied.length > 0) {
      logger.succeed(`Config applied: ${result.applied.join(", ")}`);
    } else {
      logger.info("No config changes applied.");
    }
    if (result.ignored && result.ignored.length > 0) {
      logger.warn(`Ignored: ${result.ignored.join(", ")}`);
    }
  } catch (error) {
    throw new Error(formatHttpError(error));
  }
}

/**
 * Create a new branch
 */
async function branchNew(options: {
  projectId?: string;
  name?: string;
  region?: string;
  tier?: string;
  email?: string;
}): Promise<void> {
  const root = findOmnibaseRoot();
  const config = loadConfig(root);
  const api = createProfileClient();

  const projectId = options.projectId ?? config.project_id ?? (await input({ message: "Project ID:" }));
  const branchName = options.name ?? (await input({ message: "Branch name:", default: "dev" }));
  const email = options.email ?? (await input({ message: "Billing email:" }));

  let region = options.region;
  let tier = options.tier;

  if (!region || !tier) {
    try {
      const optsRes = await api.get("/api/v1/options");
      const opts = optsRes.data;

      if (!region && opts.regions?.length) {
        region = await select({
          message: "Region:",
          choices: opts.regions.map((r: any) => ({ name: `${r.name} (${r.id})`, value: r.id })),
        });
      }

      if (!tier && opts.tiers?.length) {
        tier = await select({
          message: "Deployment tier:",
          choices: opts.tiers.map((t: any) => ({ name: `${t.name}`, value: t.id })),
        });
      }
    } catch {
      if (!region) region = await input({ message: "Region:", default: "syd" });
      if (!tier) tier = await input({ message: "Deployment tier:", default: "shared" });
    }
  }

  logger.start(`Creating branch '${branchName}'...`);

  try {
    const response = await api.post("/api/v1/project_branches", {
      project_id: projectId,
      branch_name: branchName,
      region,
      deployment_tier: tier,
      billing_email: email,
    });

    const data = response.data;
    logger.succeed(`Branch '${branchName}' provisioning started`);
    logger.log(`   Branch ID: ${data.branch_id}`);
    logger.log(`   Status: ${data.status}`);
    logger.log("");
    logger.log("Next steps:");
    logger.log(`   Use --env ${branchName} with any command once provisioning completes:`);
    logger.log(`   omnibase cloud workers deploy --env ${branchName}`);
    logger.log(`   omnibase db migrate push --env ${branchName}`);
  } catch (error) {
    throw new Error(formatHttpError(error));
  }
}

/**
 * List branches for a project
 */
async function branchList(projectIdFlag?: string): Promise<void> {
  const root = findOmnibaseRoot();
  const api = createProfileClient();

  const config = loadConfig(root);
  const projectId = projectIdFlag ?? config.project_id;

  if (!projectId) {
    throw new Error("project_id is required. Provide --project-id or set it in omnibase.toml");
  }

  logger.start("Fetching branches...");

  try {
    const response = await api.get(`/api/v1/projects/${projectId}/branches`);
    const branches = response.data;

    logger.succeed(`Found ${branches?.length || 0} branches`);

    if (!branches || branches.length === 0) return;

    for (const b of branches) {
      const statusIcon = b.status === "active" ? "✓" : b.status === "provisioning" ? "…" : "✗";
      logger.log(` ${statusIcon} ${b.name} (${b.slug}) — ${b.status}`);
      if (b.api_url) logger.log(`      URL: ${b.api_url}`);
    }
  } catch (error) {
    logger.fail("Failed to fetch branches");
    throw new Error(formatHttpError(error));
  }
}

/**
 * Delete a branch by name or ID
 */
async function branchDelete(branchRef: string, projectIdFlag?: string): Promise<void> {
  const root = findOmnibaseRoot();
  const api = createProfileClient();

  const config = loadConfig(root);
  const projectId = projectIdFlag ?? config.project_id;

  if (!projectId) {
    throw new Error("project_id is required. Provide --project-id or set it in omnibase.toml");
  }

  logger.start(`Resolving branch '${branchRef}'...`);

  const response = await api.get(`/api/v1/projects/${projectId}/branches`);
  const branches = response.data;
  const match = branches.find(
    (b: any) => b.id === branchRef || b.name === branchRef || b.slug === branchRef,
  );
  if (!match) {
    logger.fail(`Branch '${branchRef}' not found`);
    throw new Error(`Branch '${branchRef}' not found in project ${projectId}`);
  }

  logger.succeed(`Resolved to ${match.name} (${match.id})`);
  logger.start(`Deprovisioning branch '${branchRef}'...`);

  try {
    await api.delete(`/api/v1/project_branches/${match.id}`);
    logger.succeed(`Branch '${branchRef}' deprovisioning started`);
  } catch (error) {
    logger.fail("Failed to deprovision branch");
    throw new Error(formatHttpError(error));
  }
}

/**
 * List workers for a branch
 */
async function listWorkers(envFlag?: string): Promise<void> {
  const env = await selectEnvironment(envFlag);

  const api = createManagedHostingClient(env);
  const branchId = env.branchId;

  if (!branchId) {
    throw new Error("No branch selected");
  }

  logger.start("Fetching workers...");

  try {
    const response = await api.get(`/api/v1/project_branches/${branchId}/workers`);
    const workers = response.data;

    logger.succeed(`Found ${workers?.length || 0} worker(s)`);

    if (!workers || workers.length === 0) return;

    for (const w of workers) {
      logger.log(` ${w.name}${w.worker_url ? ` — ${w.worker_url}` : ""}`);
    }
  } catch (error) {
    logger.fail("Failed to fetch workers");
    throw new Error(formatHttpError(error));
  }
}

/**
 * Add cloud commands to the CLI program
 */
export function addCloudCommands(program: Command): void {
  const cloud = program
    .command("cloud")
    .description("Manage OmniBase Cloud (authentication and deployments)");

  cloud
    .command("login")
    .description("Login to OmniBase Cloud")
    .argument("<api_key>", "API Key")
    .option("--url <url>", "Managed hosting URL")
    .option("--name <name>", "Profile name")
    .action(async (apiKey, options) => {
      await login(apiKey, options);
    });

  cloud
    .command("logout [profile]")
    .description(
      "Logout from OmniBase Cloud (interactive if no profile specified)"
    )
    .option("--all", "Remove all profiles")
    .action(async (profile, options) => {
      try {
        await logout(options, profile);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("User force closed")
        ) {
          logger.warn("Logout cancelled");
          return;
        }
        await handleCommandError(error);
      }
    });

  cloud
    .command("switch [profile]")
    .description("Switch active profile (interactive if no profile specified)")
    .action(async (profile) => {
      try {
        await switchProfile(profile);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("User force closed")
        ) {
          logger.warn("Switch cancelled");
          return;
        }
        await handleCommandError(error);
      }
    });

  cloud
    .command("profiles")
    .description("List authentication profiles")
    .action(async () => {
      await listProfiles();
    });

  // Workers subcommand
  const workers = cloud
    .command("workers")
    .description("Manage Cloudflare Workers deployments");

  workers
    .command("deploy")
    .description("Deploy workers to Cloudflare")
    .option("--name <name>", "Deploy a specific deployment by name")
    .option("--all", "Deploy all deployments")
    .action(async (cmdOptions) => {
      try {
        const globalOptions = program.opts();
        await deployWorkers(globalOptions.env, cmdOptions.name, cmdOptions.all);
      } catch (error) {
        await handleCommandError(error);
      }
    });

  workers
    .command("list")
    .description("List deployed workers for a branch")
    .action(async () => {
      try {
        const globalOptions = program.opts();
        await listWorkers(globalOptions.env);
      } catch (error) {
        await handleCommandError(error);
      }
    });

  // Branch subcommand
  const branch = cloud
    .command("branch")
    .description("Manage project branches");

  branch
    .command("new")
    .description("Create a new project branch")
    .option("--project-id <id>", "Project ID")
    .option("--name <name>", "Branch name")
    .option("--region <region>", "Region (e.g. syd)")
    .option("--tier <tier>", "Deployment tier (e.g. shared)")
    .option("--email <email>", "Billing email")
    .action(async (cmdOptions) => {
      try {
        await branchNew(cmdOptions);
      } catch (error) {
        await handleCommandError(error);
      }
    });

  branch
    .command("list")
    .description("List branches")
    .option("--project-id <id>", "Project ID")
    .action(async (cmdOptions) => {
      try {
        await branchList(cmdOptions.projectId);
      } catch (error) {
        await handleCommandError(error);
      }
    });

  branch
    .command("rm <branch>")
    .description("Delete a branch by name, slug, or ID")
    .option("--project-id <id>", "Project ID")
    .action(async (branchRef, cmdOptions) => {
      try {
        await branchDelete(branchRef, cmdOptions.projectId);
      } catch (error) {
        await handleCommandError(error);
      }
    });

  // Environment subcommand
  const envCmd = cloud
    .command("env")
    .description("Manage environment configuration");

  envCmd
    .command("push")
    .description("Push omnibase.toml config to managed hosting")
    .option(
      "--from-env <path>",
      "Env file to resolve {VAR} secrets from (in addition to process.env). Never reads .env.local."
    )
    .action(async (cmdOptions) => {
      try {
        const globalOptions = program.opts();
        await pushEnvConfig(globalOptions.env, cmdOptions.fromEnv);
      } catch (error) {
        await handleCommandError(error);
      }
    });
}
