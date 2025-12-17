import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { getActiveProfile } from "./credentials";

export interface EnvironmentConfig {
  name: string;
  apiUrl: string;
  apiKey?: string;
  projectId?: string;
  managedHostingUrl?: string;
  stripeSecretKey?: string;
  stripePublishableKey?: string;
  stripeWebhookSecret?: string;
  typegenApiUrl?: string;
}

export interface OmnibaseConfig {
  defaultEnvironment?: string;
  version: string;
}

/**
 * Find the omnibase root directory
 */
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
    "OmniBase project not found. Run 'omnibase init' to initialize a project."
  );
}

/**
 * Get the project name from the parent directory of omnibase folder
 * Used for Docker Compose project namespacing to isolate different projects
 */
export function getProjectName(): string {
  const projectRoot = findOmnibaseRoot();
  return path.basename(projectRoot);
}

/**
 * Get the path to the omnibase config file
 */
export function getConfigPath(): string {
  const projectRoot = findOmnibaseRoot();
  return path.join(projectRoot, "omnibase", ".omnibase-config");
}

/**
 * Load omnibase configuration
 */
export function loadOmnibaseConfig(): OmnibaseConfig {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    return { version: "1.0.0" };
  }

  try {
    const configContent = fs.readFileSync(configPath, "utf8");
    return JSON.parse(configContent);
  } catch (error) {
    console.warn(`Warning: Could not parse config file. Using defaults.`);
    return { version: "1.0.0" };
  }
}

/**
 * Save omnibase configuration
 */
export function saveOmnibaseConfig(config: OmnibaseConfig): void {
  const configPath = getConfigPath();
  const configDir = path.dirname(configPath);

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

/**
 * Get list of available environments
 */
export function getAvailableEnvironments(): string[] {
  try {
    const projectRoot = findOmnibaseRoot();
    const environmentsDir = path.join(projectRoot, "omnibase", "environments");

    if (!fs.existsSync(environmentsDir)) {
      return [];
    }

    return fs
      .readdirSync(environmentsDir)
      .filter((file) => file.startsWith(".env."))
      .map((file) => file.replace(".env.", ""))
      .sort();
  } catch (error) {
    return [];
  }
}

/**
 * Load environment configuration
 */
export function loadEnvironment(envName?: string): EnvironmentConfig {
  const projectRoot = findOmnibaseRoot();

  // Determine which environment to use
  let environmentName = envName;

  if (!environmentName) {
    // Check stored default
    const config = loadOmnibaseConfig();
    environmentName = config.defaultEnvironment || "local";
  }

  // Load the .env file
  const envPath = path.join(
    projectRoot,
    "omnibase",
    "environments",
    `.env.${environmentName}`
  );

  if (!fs.existsSync(envPath)) {
    throw new Error(
      `Environment file not found: .env.${environmentName}\n` +
        `Available environments: ${getAvailableEnvironments().join(", ")}`
    );
  }

  // Parse environment file
  const envConfig = config({ path: envPath });
  const env = envConfig.parsed || {};

  if (!env.API_URL) throw new Error("API_URL not set");

  return {
    name: environmentName,
    apiUrl: env.API_URL,
    apiKey: env.OMNIBASE_API_KEY,
    projectId: env.OMNIBASE_PROJECT_ID,
    managedHostingUrl: env.MANAGED_HOSTING_URL,
    stripeSecretKey: env.STRIPE_SECRET_KEY,
    stripePublishableKey: env.STRIPE_PUBLISHABLE_KEY,
    stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
    typegenApiUrl: env.TYPEGEN_API_URL,
  };
}

/**
 * Resolve environment with priority: flag > default > local
 */
export function resolveEnvironment(envFlag?: string): EnvironmentConfig {
  try {
    let envName = "local";
    if (envFlag) {
      envName = envFlag;
    } else {
      const config = loadOmnibaseConfig();
      envName = config.defaultEnvironment || "local";
    }

    const envConfig = loadEnvironment(envName);

    // If not local, enrich with active profile API key
    if (envName !== "local") {
      const profile = getActiveProfile();
      if (profile) {
        return {
          ...envConfig,
          apiKey: profile.api_key,
        };
      }
    }

    return envConfig;
  } catch (error) {
    // Fallback to local
    try {
      return loadEnvironment("local");
    } catch (fallbackError) {
      throw new Error(
        `Could not load any environment. Please ensure you have a .env.local file in omnibase/environments/`
      );
    }
  }
}
