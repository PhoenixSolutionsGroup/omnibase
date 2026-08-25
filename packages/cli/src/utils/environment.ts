import * as fs from "fs";
import * as path from "path";
import { config as dotenvConfig } from "dotenv";
import { select } from "@inquirer/prompts";
import axios from "axios";
import { getActiveProfile } from "./credentials";
import { loadConfig, OmnibaseConfig } from "./config";

export interface EnvironmentConfig {
  name: string;
  omnibaseApiUrl: string;
  omnibaseServiceKey?: string;
  branchId?: string;
  managedHostingApiUrl?: string;
  stripeSecretKey?: string;
  stripePublishableKey?: string;
  stripeWebhookSecret?: string;
  typegenApiUrl?: string;
  profileApiKey?: string;
}

interface BranchSummary {
  id: string;
  name: string;
  slug: string;
  status: string;
  api_url?: string;
}

export function findOmnibaseRoot(): string {
  let currentDir = process.cwd();

  while (currentDir !== path.parse(currentDir).root) {
    const omnibaseDir = path.join(currentDir, "omnibase");
    if (fs.existsSync(omnibaseDir)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  throw new Error(
    "OmniBase project not found. Run 'omnibase init' to initialize a project.",
  );
}

export function getProjectName(): string {
  const projectRoot = findOmnibaseRoot();
  return path.basename(projectRoot);
}

export function getAvailableEnvironments(): string[] {
  const envs: string[] = [];
  const root = findOmnibaseRoot();

  const localEnvPath = path.join(root, "omnibase", ".env.local");
  if (fs.existsSync(localEnvPath)) {
    envs.push("local");
  }

  return envs;
}

export async function getCloudBranches(): Promise<string[]> {
  const profile = getActiveProfile();
  if (!profile) return [];

  const config = loadConfig(findOmnibaseRoot());
  if (!config.project_id) return [];

  try {
    const branches = await fetchBranches(config.project_id);
    return branches.map((b) => b.name);
  } catch {
    return [];
  }
}

function getManagedHostingUrl(): string | undefined {
  const profile = getActiveProfile();
  if (profile?.managed_hosting_url) return profile.managed_hosting_url;
  return process.env.MANAGED_HOSTING_API_URL || undefined;
}

function getProfileApiKey(): string | undefined {
  const profile = getActiveProfile();
  return profile?.api_key || undefined;
}

async function fetchBranches(projectId: string): Promise<BranchSummary[]> {
  const baseUrl = getManagedHostingUrl();
  if (!baseUrl) throw new Error("No managed hosting URL configured. Login with 'omnibase cloud login'.");

  const apiKey = getProfileApiKey();
  const headers: Record<string, string> = {};
  if (apiKey) headers["X-Api-Key"] = apiKey;

  const response = await axios.get(`${baseUrl}/api/v1/projects/${projectId}/branches`, { headers });
  const data = response.data;
  return Array.isArray(data) ? data : [];
}

export function loadLocalEnvironment(
  projectRoot?: string,
  config?: OmnibaseConfig,
): EnvironmentConfig {
  const root = projectRoot ?? findOmnibaseRoot();

  const envPath = path.join(root, "omnibase", ".env.local");

  const envConfig = dotenvConfig({ path: envPath });
  const env = envConfig.parsed || {};

  return {
    name: "local",
    omnibaseApiUrl: env.OMNIBASE_API_URL || "http://localhost:8080",
    omnibaseServiceKey: env.OMNIBASE_SERVICE_KEY,
    branchId: env.OMNIBASE_BRANCH_ID || env.OMNIBASE_PROJECT_ID,
    managedHostingApiUrl:
      env.MANAGED_HOSTING_API_URL || "https://api.omnibase.com",
    stripeSecretKey: env.STRIPE_SECRET_KEY,
    stripePublishableKey: env.STRIPE_PUBLISHABLE_KEY,
    stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
    typegenApiUrl: env.TYPEGEN_API_URL,
  };
}

async function loadBranchEnvironment(
  branch: BranchSummary,
  projectId: string,
): Promise<EnvironmentConfig> {
  const baseUrl = getManagedHostingUrl();
  const apiKey = getProfileApiKey();
  const headers: Record<string, string> = {};
  if (apiKey) headers["X-Api-Key"] = apiKey;

  let apiUrl = branch.api_url || "";
  let serviceKey: string | undefined;

  try {
    const keyResponse = await axios.get(
      `${baseUrl}/api/v1/project_branches/${branch.id}/api-service-key`,
      { headers },
    );
    const keyData = keyResponse.data?.data ?? keyResponse.data;
    serviceKey = keyData?.api_service_key ?? keyData?.service_key;
  } catch {
    // service key fetch is optional — proceed without it
  }

  return {
    name: branch.name,
    omnibaseApiUrl: apiUrl,
    omnibaseServiceKey: serviceKey,
    branchId: branch.id,
    managedHostingApiUrl: baseUrl,
    profileApiKey: apiKey,
  };
}

export async function selectEnvironment(
  envFlag?: string,
): Promise<EnvironmentConfig> {
  const root = findOmnibaseRoot();
  const config = loadConfig(root);
  const profile = getActiveProfile();

  if (envFlag) {
    if (envFlag === "local") {
      const envConfig = loadLocalEnvironment(root, config);
      if (profile) {
        return { ...envConfig, profileApiKey: profile.api_key };
      }
      return envConfig;
    }

    if (config.project_id) {
      const branches = await fetchBranches(config.project_id);
      const match = branches.find((b) => b.name === envFlag || b.slug === envFlag);
      if (match) {
        return loadBranchEnvironment(match, config.project_id);
      }
    }

    throw new Error(
      `Environment not found: ${envFlag}`,
    );
  }

  let remote: BranchSummary[] = [];

  if (config.project_id) {
    try {
      remote = await fetchBranches(config.project_id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`Warning: could not fetch branches: ${msg}`);
    }
  }

  const hasLocal = fs.existsSync(path.join(root, "omnibase", ".env.local"));

  if (remote.length === 0 && !hasLocal) {
    throw new Error(
      "No environments available. Either set up omnibase/.env.local or connect to OmniBase Cloud with 'omnibase cloud login'.",
    );
  }

  const choices: { name: string; value: string }[] = [];

  if (hasLocal && remote.length === 0) {
    choices.push({ name: "local", value: "local" });
  }

  for (const branch of remote) {
    choices.push({ name: branch.name, value: branch.name });
  }

  if (hasLocal && remote.length > 0) {
    choices.push({ name: "local", value: "local" });
  }

  const selectedValue = await select({
    message: "Select environment:",
    choices,
  });

  if (selectedValue === "local") {
    const envConfig = loadLocalEnvironment(root, config);
    if (profile) {
      return { ...envConfig, profileApiKey: profile.api_key };
    }
    return envConfig;
  }

  const match = remote.find((b) => b.name === selectedValue);
  if (!match) throw new Error(`Branch '${selectedValue}' not found`);
  return loadBranchEnvironment(match, config.project_id!);
}
