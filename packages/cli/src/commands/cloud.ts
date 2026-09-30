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
  loadSecretsMap,
  assertValidVersions,
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
  const config = loadConfig(root);
  const secrets = loadSecretsMap(root, env.name);
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
        env: { ...process.env, ...secrets },
      });
    } catch (error) {
      logger.fail(`Build failed for '${dep.name}'. Check the output above.`);
      continue;
    }

    const bundle = await packageWorkerBundle(workersDir, secrets);
    logger.succeed(`${dep.name}: packaged (${(bundle.length / 1024).toFixed(1)} KB)`);

    logger.start(`Deploying '${dep.name}'...`);
    try {
      const result = await uploadToManagedHosting(env, bundle, dep.name);
      logger.succeed(`${dep.name} deployed`);
      logger.log(`   URL: ${result.data?.url}`);
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
export async function packageWorkerBundle(
  workersDir: string,
  secrets: Record<string, string> = {},
): Promise<Buffer> {
  const config = (await interpolateValue(
    await loadWranglerConfig(workersDir),
    secrets,
  )) as any;
  delete config.build;
  delete config.name;
  config.main = await resolveBundleEntry(
    path.join(workersDir, ".bundle"),
    config.main
  );

  const zip = new JSZip();
  await addDirToZip(zip, path.join(workersDir, ".bundle"), (name) =>
    name.endsWith(".map") || name === "README.md"
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

export async function resolveBundleEntry(
  bundleDir: string,
  configuredMain?: string
): Promise<string> {
  const entries = await readdir(bundleDir, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && !e.name.endsWith(".map"))
    .map((e) => e.name);

  if (configuredMain) {
    const base = path.basename(configuredMain).replace(/\.[^.]+$/, "");
    const match = files.find(
      (f) => path.basename(f).replace(/\.[^.]+$/, "") === base
    );
    if (match) return match;
  }

  const candidates = files.filter(
    (f) => !f.startsWith("chunk-") && /\.(js|mjs)$/.test(f)
  );
  if (candidates.length === 1) return candidates[0];

  throw new Error(
    "Could not determine the worker entry module. Check the .bundle output."
  );
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
 * {VAR} secrets resolve from process.env → omnibase/.env.<branch>.
 */
export async function pushEnvConfig(envFlag?: string): Promise<void> {
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

  const secrets = loadSecretsMap(root, env.name);

  const resolved = interpolateValue(config, secrets) as OmnibaseConfig;
  if (resolved.versions) {
    assertValidVersions(resolved.versions);
  }
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
        `Set them in process.env or omnibase/.env.${env.name}.`
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
 * Add an account-level custom domain (e.g. example.com or *.example.com)
 */
async function domainAdd(
  envFlag: string | undefined,
  domain: string
): Promise<void> {
  const env = await selectEnvironment(envFlag);
  const api = createManagedHostingClient(env);

  logger.start(`Adding domain ${domain}...`);

  try {
    const response = await api.post(`/api/v1/domains`, { hostname: domain });
    const d = response.data;

    logger.succeed(`Domain ${domain} added (status: ${d.status})`);
    if (d.dcv_record_name && d.dcv_record_value) {
      logger.log("Add these DNS records at your domain provider:");
      logger.log(` ${d.hostname} CNAME → ${d.cname_target}`);
      logger.log(` ${d.dcv_record_name} TXT → ${d.dcv_record_value}`);
      logger.log("Then run: omnibase cloud domains status <id>");
    } else {
      logger.log(`Point ${domain} to ${d.cname_target}`);
    }
  } catch (error) {
    logger.fail("Failed to add domain");
    throw new Error(formatHttpError(error));
  }
}

/**
 * List account-level domains
 */
async function domainList(envFlag: string | undefined): Promise<void> {
  const env = await selectEnvironment(envFlag);
  const api = createManagedHostingClient(env);

  logger.start("Fetching domains...");

  try {
    const response = await api.get(`/api/v1/domains`);
    const domains = response.data;

    logger.succeed(`Found ${domains?.length || 0} domain(s)`);

    if (!domains || domains.length === 0) return;

    for (const d of domains) {
      logger.log(` ${d.hostname} — ${d.status}${d.ssl_status ? ` (ssl: ${d.ssl_status})` : ""}`);
    }
  } catch (error) {
    logger.fail("Failed to fetch domains");
    throw new Error(formatHttpError(error));
  }
}

/**
 * Remove an account-level domain
 */
async function domainRemove(
  envFlag: string | undefined,
  domainId: string
): Promise<void> {
  const env = await selectEnvironment(envFlag);
  const api = createManagedHostingClient(env);

  logger.start("Removing domain...");

  try {
    await api.delete(`/api/v1/domains/${domainId}`);
    logger.succeed("Domain removed");
  } catch (error) {
    logger.fail("Failed to remove domain");
    throw new Error(formatHttpError(error));
  }
}

/**
 * Poll the status of an account-level domain until it activates or times out
 */
async function domainStatus(
  envFlag: string | undefined,
  domainId: string,
  pollSeconds: number
): Promise<void> {
  const env = await selectEnvironment(envFlag);
  const api = createManagedHostingClient(env);

  const deadline = Date.now() + pollSeconds * 1000;

  try {
    while (Date.now() < deadline) {
      const response = await api.get(`/api/v1/domains/${domainId}/status`);
      const d = response.data;

      logger.log(` ${d.hostname} — ${d.status}${d.ssl_status ? ` (ssl: ${d.ssl_status})` : ""}`);

      if (d.status === "active") {
        logger.succeed(`Domain ${d.hostname} is live`);
        return;
      }

      if (d.dcv_record_name && d.dcv_record_value && d.status !== "active") {
        logger.log("DNS records needed:");
        logger.log(` ${d.hostname} CNAME → ${d.cname_target}`);
        logger.log(` ${d.dcv_record_name} TXT → ${d.dcv_record_value}`);
        logger.log("Waiting for DNS + certificate issuance...");
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    logger.fail("Timed out waiting for domain activation");
  } catch (error) {
    logger.fail("Failed to check domain status");
    throw new Error(formatHttpError(error));
  }
}

/**
 * Attach a validated account domain to a worker
 */
async function domainAttach(
  envFlag: string | undefined,
  domainId: string,
  workerName: string,
  hostname?: string
): Promise<void> {
  const env = await selectEnvironment(envFlag);
  const api = createManagedHostingClient(env);
  const branchId = env.branchId;

  if (!branchId) {
    throw new Error("No branch selected");
  }

  logger.start(`Attaching domain ${domainId} to worker ${workerName}...`);

  try {
    const body: Record<string, string> = { account_domain_id: domainId };
    if (hostname) body.hostname = hostname;

    const response = await api.post(
      `/api/v1/project_branches/${branchId}/workers/${encodeURIComponent(workerName)}/domains`,
      body
    );
    const d = response.data;

    logger.succeed(`Domain ${d.hostname} attached (status: ${d.status})`);
  } catch (error) {
    logger.fail("Failed to attach domain");
    throw new Error(formatHttpError(error));
  }
}

/**
 * Detach a domain from a worker
 */
async function domainDetach(
  envFlag: string | undefined,
  domainId: string
): Promise<void> {
  const env = await selectEnvironment(envFlag);
  const api = createManagedHostingClient(env);
  const branchId = env.branchId;

  if (!branchId) {
    throw new Error("No branch selected");
  }

  logger.start("Removing domain from worker...");

  try {
    await api.delete(`/api/v1/project_branches/${branchId}/worker-domains/${domainId}`);
    logger.succeed("Domain removed from worker");
  } catch (error) {
    logger.fail("Failed to remove domain from worker");
    throw new Error(formatHttpError(error));
  }
}

/**
 * Add cloud commands to the CLI program
 */
export function addCloudCommands(program: Command): void {
  const cloud = program
    .command("cloud")
    .summary("Manage OmniBase Cloud")
    .description(
      "Manage OmniBase Cloud — profile authentication, branch provisioning, " +
      "Cloudflare Workers deployments, custom domains, and environment config.\n\n" +
      "Start with `login` to authenticate with an API key and create a profile, " +
      "then `workers deploy` to ship deployments and `env push` to sync " +
      "omnibase.toml config to a branch."
    );

  cloud
    .command("login")
    .summary("Authenticate with an API key and save a profile")
    .description(
      "Verify an API key against the managed hosting API and save it as a " +
      "local profile.\n\n" +
      "The profile is named after the tenant and key (or `--name`) and is set " +
      "as active, so subsequent cloud commands use it automatically. " +
      "Authentication is stored in the CLI credentials file, not in the project.\n\n" +
      "Before: obtain an API key from the OmniBase dashboard.\n" +
      "After: a profile is saved and active. Verify with `omnibase cloud profiles`.\n\n" +
      "```bash\n" +
      "omnibase cloud login sk_live_abc123\n" +
      "omnibase cloud login sk_live_abc123 --name staging\n" +
      "omnibase cloud login sk_live_abc123 --url https://api.omnibase.io\n" +
      "```"
    )
    .argument("<api_key>", "API Key")
    .option("--url <url>", "Managed hosting URL")
    .option("--name <name>", "Profile name")
    .action(async (apiKey, options) => {
      await login(apiKey, options);
    });

  cloud
    .command("logout [profile]")
    .summary("Remove saved authentication profiles")
    .description(
      "Remove one, several, or all saved profiles.\n\n" +
      "With a `[profile]` argument only that profile is removed. Without one, " +
      "an interactive multi-select prompt shows all profiles. `--all` removes " +
      "every profile and clears the active profile.\n\n" +
      "If the active profile is removed, the first remaining profile becomes " +
      "active (or none if the list is empty).\n\n" +
      "```bash\n" +
      "omnibase cloud logout\n" +
      "omnibase cloud logout staging\n" +
      "omnibase cloud logout --all\n" +
      "```"
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
    .summary("Change the active profile")
    .description(
      "Set which saved profile subsequent cloud commands use.\n\n" +
      "With a `[profile]` argument the profile is switched directly. Without " +
      "one, an interactive select shows all saved profiles with the current " +
      "one marked.\n\n" +
      "Before: at least one profile must exist (see `omnibase cloud login`).\n" +
      "After: cloud commands resolve credentials from the active profile.\n\n" +
      "```bash\n" +
      "omnibase cloud switch\n" +
      "omnibase cloud switch acme-prod\n" +
      "```"
    )
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
    .summary("List saved authentication profiles")
    .description(
      "List every saved profile with its tenant, key name, and key prefix, " +
      "marking the active profile.\n\n" +
      "Before: at least one profile must exist (see `omnibase cloud login`).\n\n" +
      "```bash\n" +
      "omnibase cloud profiles\n" +
      "```"
    )
    .action(async () => {
      await listProfiles();
    });

  // Workers subcommand
  const workers = cloud
    .command("workers")
    .summary("Manage Cloudflare Workers deployments")
    .description(
      "Deploy and inspect the Workers deployments defined in omnibase.toml " +
      "or `omnibase/workers/`.\n\n" +
      "Each deployment maps to a directory (default `omnibase/workers/`) " +
      "containing a `wrangler.toml`, `wrangler.jsonc`, or `wrangler.json`. " +
      "`deploy` ships a deployment to the managed hosting cloud; `list` shows " +
      "what is currently deployed for a branch."
    );

  workers
    .command("deploy")
    .summary("Deploy workers to Cloudflare via managed hosting")
    .description(
      "Build, package, and upload one or more Workers deployments for the " +
      "selected cloud branch.\n\n" +
      "End-to-end flow:\n" +
      "1. Resolve the target environment (`--env` or interactive picker).\n" +
      "2. Load the resolved secrets for that branch (see env resolution below).\n" +
      "3. Run `bunx wrangler deploy --dry-run --outdir .bundle` in the " +
      "   deployment directory with the resolved env exported. If the wrangler " +
      "   config declares a `build.command`, wrangler runs it first, so the app " +
      "   is built as part of the deploy; the result is a production bundle.\n" +
      "4. Package the bundle plus any `[assets]` into a self-contained zip, " +
      "   with the deployment's `wrangler.json` `[vars]` interpolated at " +
      "   package time.\n" +
      "5. Upload the bundle to managed hosting, which runs " +
      "   `wrangler deploy --dispatch-namespace` and returns the live URL.\n\n" +
      "By default a single-deployment project deploys it directly; with " +
      "multiple deployments you are prompted to select one. `--name` picks a " +
      "specific deployment by name and `--all` deploys every deployment.\n\n" +
      "Before: the branch must be provisioned (has a branch ID) and a profile " +
      "must be configured (`omnibase cloud login`). Deployments must exist in " +
      "omnibase.toml or `omnibase/workers/`. Cloud environments are required — " +
      "deploying to `local` is not supported.\n\n" +
      "Environment variables: `{VAR}` references in the wrangler `[vars]` " +
      "resolve from the branch env file. See the env resolution model on the " +
      "[`cloud env`](/reference/cli/cloud/env) page.\n\n" +
      "Caveats: values in `[vars]` are visible in the deployed worker — put " +
      "secrets in `wrangler secret` or the managed-hosting secrets API, not in " +
      "`[vars]`. Unresolved `{VAR}` values are left literal and the CLI warns.\n\n" +
      "```bash\n" +
      "omnibase cloud workers deploy --env dev\n" +
      "omnibase cloud workers deploy --env staging --name api\n" +
      "omnibase cloud workers deploy --env production --all\n" +
      "```"
    )
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
    .summary("List deployed workers for a branch")
    .description(
      "List the workers currently deployed for the selected branch, including " +
      "their public URLs.\n\n" +
      "Before: a profile must be configured and the branch must be provisioned.\n\n" +
      "```bash\n" +
      "omnibase cloud workers list --env dev\n" +
      "```"
    )
    .action(async () => {
      try {
        const globalOptions = program.opts();
        await listWorkers(globalOptions.env);
      } catch (error) {
        await handleCommandError(error);
      }
    });

  const domains = cloud
    .command("domains")
    .summary("Manage account-level custom domains")
    .description(
      "Add, validate, and attach custom domains (e.g. `example.com` or " +
      "`*.example.com`) to workers.\n\n" +
      "Domains are account-level: add one, point your DNS records at it, " +
      "wait for activation with `status`, then attach it to a worker with " +
      "`attach`."
    );

  domains
    .command("add <domain>")
    .summary("Add a custom domain")
    .description(
      "Add an account-level custom domain, for example `example.com` or " +
      "`*.example.com`.\n\n" +
      "The response includes the CNAME target and, when required, a TXT " +
      "DCV record. Add these at your DNS provider, then poll with " +
      "`omnibase cloud domains status <id>` until the domain is active.\n\n" +
      "Before: a profile and a provisioned branch must be configured.\n\n" +
      "```bash\n" +
      "omnibase cloud domains add example.com --env dev\n" +
      "omnibase cloud domains add '*.example.com' --env dev\n" +
      "```"
    )
    .action(async (domain, cmdOptions) => {
      try {
        const globalOptions = program.opts();
        await domainAdd(globalOptions.env, domain);
      } catch (error) {
        await handleCommandError(error);
      }
    });

  domains
    .command("list")
    .summary("List account-level custom domains")
    .description(
      "List every account-level domain with its status and SSL status.\n\n" +
      "```bash\n" +
      "omnibase cloud domains list --env dev\n" +
      "```"
    )
    .action(async () => {
      try {
        const globalOptions = program.opts();
        await domainList(globalOptions.env);
      } catch (error) {
        await handleCommandError(error);
      }
    });

  domains
    .command("rm <domain-id>")
    .summary("Remove a custom domain")
    .description(
      "Remove a custom domain by ID and detach it from all workers.\n\n" +
      "Use `omnibase cloud domains list` to find the domain ID.\n\n" +
      "```bash\n" +
      "omnibase cloud domains list --env dev\n" +
      "omnibase cloud domains rm dom_123 --env dev\n" +
      "```"
    )
    .action(async (domainId, cmdOptions) => {
      try {
        const globalOptions = program.opts();
        await domainRemove(globalOptions.env, domainId);
      } catch (error) {
        await handleCommandError(error);
      }
    });

  domains
    .command("status <domain-id>")
    .summary("Poll domain status until active")
    .description(
      "Poll the status of a custom domain until it activates or the timeout " +
      "elapses (default 120s).\n\n" +
      "While DNS and certificate issuance are pending it prints the records " +
      "still needed; it exits successfully as soon as the domain is live.\n\n" +
      "Before: the domain must exist (see `omnibase cloud domains add`).\n\n" +
      "```bash\n" +
      "omnibase cloud domains status dom_123 --env dev\n" +
      "omnibase cloud domains status dom_123 --timeout 300 --env dev\n" +
      "```"
    )
    .option("--timeout <seconds>", "Poll timeout in seconds", "120")
    .action(async (domainId, cmdOptions) => {
      try {
        const globalOptions = program.opts();
        await domainStatus(globalOptions.env, domainId, parseInt(cmdOptions.timeout, 10));
      } catch (error) {
        await handleCommandError(error);
      }
    });

  domains
    .command("attach <domain-id>")
    .summary("Attach a validated domain to a worker")
    .description(
      "Attach an activated account-level domain to a worker on the current " +
      "branch.\n\n" +
      "`--worker` is required and names the deployment (matching the name in " +
      "omnibase.toml or `omnibase/workers/`). For wildcard domains use " +
      "`--hostname` to choose the concrete hostname to route.\n\n" +
      "Before: the domain must be active (see `omnibase cloud domains status`).\n\n" +
      "```bash\n" +
      "omnibase cloud domains attach dom_123 --worker api --env dev\n" +
      "omnibase cloud domains attach dom_123 --worker api --hostname www.example.com --env dev\n" +
      "```"
    )
    .requiredOption("--worker <name>", "Worker deployment name")
    .option("--hostname <hostname>", "Concrete hostname to route (required for wildcard domains)")
    .action(async (domainId, cmdOptions) => {
      try {
        const globalOptions = program.opts();
        await domainAttach(globalOptions.env, domainId, cmdOptions.worker, cmdOptions.hostname);
      } catch (error) {
        await handleCommandError(error);
      }
    });

  domains
    .command("detach <domain-id>")
    .summary("Detach a domain from a worker")
    .description(
      "Detach a domain from the current branch's worker. The account-level " +
      "domain itself is kept.\n\n" +
      "```bash\n" +
      "omnibase cloud domains detach dom_123 --env dev\n" +
      "```"
    )
    .action(async (domainId, cmdOptions) => {
      try {
        const globalOptions = program.opts();
        await domainDetach(globalOptions.env, domainId);
      } catch (error) {
        await handleCommandError(error);
      }
    });

  // Branch subcommand
  const branch = cloud
    .command("branch")
    .summary("Manage project branches")
    .description(
      "Provision, list, and deprovision project branches.\n\n" +
      "Each branch is an isolated environment with its own database, API, " +
      "permissions, and workers. Use `new` to provision one, then reference " +
      "it with `--env <branch>` on other cloud commands."
    );

  branch
    .command("new")
    .summary("Create a new project branch")
    .description(
      "Provision a new branch (environment) for the project.\n\n" +
      "The project ID comes from `--project-id` or the `project_id` in " +
      "omnibase.toml, and is prompted for if neither is set. Region and tier " +
      "default to a picker fed by the managed hosting options endpoint " +
      "(falling back to `syd` / `shared` prompts). A billing email is " +
      "required.\n\n" +
      "After: provisioning starts asynchronously. Once complete, use the " +
      "branch with `--env <branch>` on other commands.\n\n" +
      "```bash\n" +
      "omnibase cloud branch new --name staging\n" +
      "omnibase cloud branch new --project-id proj_123 --name dev --region syd --tier shared\n" +
      "```"
    )
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
    .summary("List project branches")
    .description(
      "List all branches for the project with their status and API URL.\n\n" +
      "Before: a profile must be configured and `project_id` must be set in " +
      "omnibase.toml (or passed with `--project-id`).\n\n" +
      "```bash\n" +
      "omnibase cloud branch list\n" +
      "omnibase cloud branch list --project-id proj_123\n" +
      "```"
    )
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
    .summary("Delete a project branch")
    .description(
      "Delete a branch by name, slug, or ID. The branch is resolved against " +
      "the project's branch list, then deprovisioning is started.\n\n" +
      "This is destructive — the branch's database, workers, and services are " +
      "deprovisioned.\n\n" +
      "```bash\n" +
      "omnibase cloud branch rm staging\n" +
      "omnibase cloud branch rm br_123 --project-id proj_123\n" +
      "```"
    )
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
    .summary("Manage environment configuration")
    .description(
      "Push configuration to a cloud branch and resolve per-environment " +
      "variables.\n\n" +
      "**Environment variable injection**\n\n" +
      "Several commands resolve `{VAR}` references in your configuration " +
      "(e.g. `website_url = \"{PUBLIC_WEBSITE_URL}\"`) from a two-layer " +
      "model:\n\n" +
      "- **omnibase/omnibase.toml** (committed) — the structure, with `{VAR}` " +
      "references for per-environment values.\n" +
      "- **omnibase/.env.<branch>** (gitignored) — flat `KEY=VALUE`, one file " +
      "per branch/environment (`.env.local` for local dev).\n\n" +
      "Resolution order, per key, first non-empty wins:\n" +
      "`process.env` → `omnibase/.env.<branch>` (from `--env` or the " +
      "interactive picker) → the literal `{VAR}` left in place.\n\n" +
      "This drives `cloud workers deploy` (wrangler build env + packaged " +
      "`[vars]`), `cloud env push` (interpolation of the cloud config " +
      "sections), and `omnibase start` (control-plane env + dev-server spawns).\n\n" +
      "Caveats: unresolved `{VAR}` values are left literal and the CLI warns; " +
      "secrets belong in the managed-hosting secrets API or `wrangler secret`, " +
      "never in `[vars]` (vars are visible in the deployed worker)."
    );

  envCmd
    .command("push")
    .summary("Push omnibase.toml config to managed hosting")
    .description(
      "Push the cloud-relevant sections of omnibase.toml to the selected " +
      "branch, interpolating `{VAR}` references first.\n\n" +
      "Everything except `[local]`, `project_id`, and `deployments` is sent; " +
      "managed hosting applies what it understands and reports the rest. " +
      "`[local]` stays on this machine — that is where Stripe lives, since " +
      "managed hosting owns Stripe env via the Connect account it provisions " +
      "per branch. `[versions]` keys are validated before push.\n\n" +
      "Before: `project_id` must be set in omnibase.toml, a profile must be " +
      "configured, and the branch must be provisioned. Pushing to `local` is " +
      "not supported.\n\n" +
      "After: the branch reports which sections were applied and which were " +
      "ignored. Unresolved `{VAR}` values are warned about and left literal.\n\n" +
      "See the env resolution model on the [`cloud env`](/reference/cli/cloud/env) page.\n\n" +
      "```bash\n" +
      "omnibase cloud env push --env dev\n" +
      "omnibase cloud env push --env staging\n" +
      "```"
    )
    .action(async (cmdOptions) => {
      try {
        const globalOptions = program.opts();
        await pushEnvConfig(globalOptions.env);
      } catch (error) {
        await handleCommandError(error);
      }
    });
}
