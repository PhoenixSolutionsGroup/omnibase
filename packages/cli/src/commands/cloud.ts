import { Command } from "commander";
import { execSync } from "child_process";
import { readFile, readdir } from "fs/promises";
import FormData from "form-data";
import JSZip from "jszip";
import * as TOML from "smol-toml";
import axios from "axios";
import { checkbox, select } from "@inquirer/prompts";
import * as path from "path";
import {
  EnvironmentConfig,
  findOmnibaseRoot,
  selectEnvironment,
} from "../utils/environment";
import {
  loadCredentials,
  saveCredentials,
  Profile,
} from "../utils/credentials";
import { logger } from "../utils/logger";
import { handleCommandError, formatHttpError } from "../utils/errors";
import { createManagedHostingClient } from "../utils/api-client";

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

    const data = response.data?.data ?? response.data;
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
      profiles.forEach((p) => logger.log(`   - ${p}`));
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
 * Deploy workers to Cloudflare via managed hosting
 */
async function deployWorkers(envFlag?: string): Promise<void> {
  const root = findOmnibaseRoot();
  const workersDir = path.join(root, "omnibase/workers");

  const env = await selectEnvironment(envFlag);

  if (env.name === "local") {
    logger.warn("Workers deployment is not available for local environment.");
    logger.log("Tip: Use 'npm run dev' in omnibase/workers for local testing.");
    logger.log("Or deploy to a cloud environment with --env flag:");
    logger.log("   omnibase cloud workers deploy --env dev");
    logger.log("   omnibase cloud workers deploy --env staging");
    logger.log("   omnibase cloud workers deploy --env production");
    return;
  }

  if (!env.branchId) {
    throw new Error(
      `OMNIBASE_BRANCH_ID not set in environment file.\n` +
        `Please add it to omnibase/environments/.env.${env.name}`
    );
  }

  if (!env.managedHostingApiUrl) {
    throw new Error(
      `MANAGED_HOSTING_API_URL not set in environment file.\n` +
        `Please add it to omnibase/environments/.env.${env.name}`
    );
  }

  logger.start(`Building workers for ${env.name} environment...`);

  try {
    execSync("bunx wrangler deploy --dry-run --outdir .bundle", {
      cwd: workersDir,
      stdio: "inherit",
    });
  } catch (error) {
    throw new Error("Build failed. Check the output above for details.");
  }

  const bundle = await packageWorkerBundle(workersDir);
  logger.succeed(`Packaged worker bundle: ${(bundle.length / 1024).toFixed(1)} KB`);

  logger.start("Deploying to Cloudflare Workers...");
  const result = await uploadToManagedHosting(env, bundle);

  logger.succeed("Workers deployed successfully");
  logger.log(`   URL: ${result.url}`);
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

async function uploadToManagedHosting(env: EnvironmentConfig, bundle: Buffer) {
  const api = createManagedHostingClient(env);
  const form = new FormData();
  form.append("bundle", bundle, {
    filename: "bundle.zip",
    contentType: "application/zip",
  });

  try {
    const response = await api.post(
      `/api/v1/projects/${env.branchId}/workers/deploy`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(formatHttpError(error));
  }
}

interface EnvPushResult {
  applied: Record<string, string[]>;
  ignored: { key: string; reason: string }[];
  services_to_restart: string[];
}

/**
 * Push environment configuration to managed hosting
 */
export async function pushEnvConfig(envFlag?: string): Promise<void> {
  const root = findOmnibaseRoot();
  const env = await selectEnvironment(envFlag);

  if (env.name === "local") {
    logger.warn("Environment push is not available for local environment.");
    logger.log("Use --env flag to specify a cloud environment:");
    logger.log("   omnibase cloud env push --env dev");
    logger.log("   omnibase cloud env push --env staging");
    logger.log("   omnibase cloud env push --env production");
    return;
  }

  if (!env.branchId) {
    throw new Error(
      `OMNIBASE_BRANCH_ID not set in environment file.\n` +
        `Please add it to omnibase/environments/.env.${env.name}`
    );
  }

  if (!env.managedHostingApiUrl) {
    throw new Error(
      `MANAGED_HOSTING_API_URL not set in environment file.\n` +
        `Please add it to omnibase/environments/.env.${env.name}`
    );
  }

  const envFilePath = path.join(
    root,
    "omnibase/environments",
    `.env.${env.name}`
  );
  const envFileContent = await readFile(envFilePath, "utf-8");

  logger.start(`Pushing environment config to ${env.name}...`);

  const api = createManagedHostingClient(env);

  try {
    const response = await api.post<EnvPushResult>(
      `/api/v1/projects/${env.branchId}/env`,
      envFileContent,
      {
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );

    const result = response.data;

    // Show applied keys per service
    const appliedServices = Object.keys(result.applied);
    if (appliedServices.length > 0) {
      logger.succeed("Environment variables applied:");
      for (const service of appliedServices) {
        const keys = result.applied[service];
        logger.log(`   ${service}: ${keys.join(", ")}`);
      }
    } else {
      logger.info("No configurable environment variables found to apply.");
    }

    // Show ignored keys
    if (result.ignored && result.ignored.length > 0) {
      logger.newline();
      logger.warn(`${result.ignored.length} key(s) ignored:`);
      for (const item of result.ignored) {
        logger.log(`   ${item.key}: ${item.reason}`);
      }
    }

    // Show restart hint
    if (result.services_to_restart && result.services_to_restart.length > 0) {
      logger.newline();
      logger.info("Services need restart to apply changes:");
      logger.log(`   ${result.services_to_restart.join(", ")}`);
      logger.log("   Run: omnibase restart <service> --env " + env.name);
    }
  } catch (error) {
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
    .action(async () => {
      try {
        const globalOptions = program.opts();
        await deployWorkers(globalOptions.env);
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
    .description("Push environment variables to managed hosting")
    .action(async () => {
      try {
        const globalOptions = program.opts();
        await pushEnvConfig(globalOptions.env);
      } catch (error) {
        await handleCommandError(error);
      }
    });
}
