import * as fs from "fs";
import * as path from "path";
import * as TOML from "smol-toml";
import { parse as dotenvParse } from "dotenv";

export interface DeploymentConfig {
  name: string;
  path?: string;
  port?: number;
}

export interface OidcProviderConfig {
  provider: string;
  client_id?: string;
  client_secret?: string;
}

export interface AuthConfig {
  website_url?: string;
  allowed_return_urls?: string[];
  cookie_secret?: string;
  log_level?: string;
  oidc?: OidcProviderConfig[];
}

/**
 * Local-development-only config. Never sent to the cloud — Stripe lives here,
 * since managed hosting owns Stripe env via the Connect account it provisions
 * per branch.
 */
export interface LocalConfig {
  env_path?: string;
  stripe?: Record<string, string>;
  [key: string]: unknown;
}

export interface OmnibaseConfig {
  project_id?: string;
  deployments: DeploymentConfig[];
  auth?: AuthConfig;
  local?: LocalConfig;
  env?: Record<string, string>;
  versions?: Record<string, string>;
  [key: string]: unknown;
}

export const VERSION_SERVICES = ["auth", "api", "perm"] as const;

export function assertValidVersions(versions: Record<string, string>): void {
  for (const [svc, ver] of Object.entries(versions)) {
    if (!VERSION_SERVICES.includes(svc as (typeof VERSION_SERVICES)[number])) {
      throw new Error(
        `[versions] key '${svc}' is not allowed. Use ${VERSION_SERVICES.join(", ")}.`,
      );
    }
    if (/[/:@]/.test(ver)) {
      throw new Error(
        `[versions] '${svc}' spec '${ver}' must be a tag, not an image reference.`,
      );
    }
  }
}

export function findConfigFile(projectRoot: string): string | null {
  const omnibaseDir = path.join(projectRoot, "omnibase");
  const candidates = [
    "omnibase.toml",
    "omnibase.jsonc",
    "omnibase.json",
    "omnibase.yaml",
    "omnibase.yml",
  ];
  for (const name of candidates) {
    const p = path.join(omnibaseDir, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export function parseConfigFile(filePath: string): Record<string, unknown> {
  const ext = path.extname(filePath);
  const content = fs.readFileSync(filePath, "utf-8");

  if (ext === ".toml") {
    return TOML.parse(content) as Record<string, unknown>;
  }

  if (ext === ".jsonc") {
    const noComments = content
      .replace(
        /\\"|"(?:\\"|[^"])*"|(\/\/[^\n\r]*|\/\*[\s\S]*?\*\/)/g,
        (m, comment) => (comment ? "" : m),
      )
      .replace(/,(\s*[}\]])/g, "$1");
    return JSON.parse(noComments);
  }

  if (ext === ".json") {
    return JSON.parse(content);
  }

  if (ext === ".yaml" || ext === ".yml") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { load } = require("js-yaml");
    return load(content) as Record<string, unknown>;
  }

  throw new Error(`Unsupported config file format: ${ext}`);
}

function loadEnvFile(pathToEnv: string): Record<string, string> {
  if (!fs.existsSync(pathToEnv)) return {};
  return dotenvParse(fs.readFileSync(pathToEnv, "utf-8"));
}

export function loadSecretsMap(
  projectRoot: string,
  envName?: string,
  localEnvPath?: string,
): Record<string, string> {
  const secrets: Record<string, string> = {};

  for (const key of Object.keys(process.env)) {
    const val = process.env[key];
    if (val !== undefined) {
      secrets[key] = val;
    }
  }

  if (envName && envName !== "local") {
    const branchEnv = loadEnvFile(
      path.join(projectRoot, "omnibase", `.env.${envName}`),
    );
    for (const [k, v] of Object.entries(branchEnv)) {
      if (!(k in secrets)) secrets[k] = v;
    }
  }

  const defaultLocal = loadEnvFile(
    path.join(projectRoot, "omnibase", ".env.local"),
  );
  for (const [k, v] of Object.entries(defaultLocal)) {
    if (!(k in secrets)) secrets[k] = v;
  }

  if (localEnvPath) {
    const resolved = loadEnvFile(path.resolve(projectRoot, localEnvPath));
    for (const [k, v] of Object.entries(resolved)) {
      if (!(k in secrets)) secrets[k] = v;
    }
  }

  return secrets;
}

function findWranglerConfigFile(workersDir: string): string | null {
  for (const name of ["wrangler.toml", "wrangler.jsonc", "wrangler.json"]) {
    const p = path.join(workersDir, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function parseWranglerConfigFile(filePath: string): Record<string, unknown> {
  const content = fs.readFileSync(filePath, "utf-8");
  if (path.extname(filePath) === ".toml") {
    return TOML.parse(content) as Record<string, unknown>;
  }
  const noComments = content
    .replace(
      /\\"|"(?:\\"|[^"])*"|(\/\/[^\n\r]*|\/\*[\s\S]*?\*\/)/g,
      (m, comment) => (comment ? "" : m),
    )
    .replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(noComments);
}

export function loadWranglerConfigFile(
  workersDir: string,
): Record<string, unknown> | null {
  const p = findWranglerConfigFile(workersDir);
  if (!p) return null;
  return parseWranglerConfigFile(p);
}

/**
 * Resolve the env vars a local dev-server process should get, mirroring the
 * cloud deploy: process.env → omnibase/.env.<env> → .env.local → [local]
 * env_path, plus `[vars]` from the deployment's wrangler config after {VAR}
 * interpolation. Later sources win.
 */
export function resolveStartEnv(
  projectRoot: string,
  envName: string,
  config: OmnibaseConfig,
  wranglerConfig?: Record<string, unknown> | null,
): Record<string, string> {
  const secrets = loadSecretsMap(projectRoot, envName, config.local?.env_path);
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined) out[k] = v;
  }
  Object.assign(out, secrets);

  if (wranglerConfig) {
    const resolved = interpolateValue(
      wranglerConfig,
      secrets,
    ) as Record<string, { vars?: Record<string, unknown> }>;
    for (const [k, v] of Object.entries(resolved.vars ?? {})) {
      if (typeof v === "string") out[k] = v;
    }
  }

  return out;
}

export function interpolateValue(
  value: unknown,
  secrets: Record<string, string>,
): unknown {
  if (typeof value === "string") {
    const pattern = /\{(\w+)\}/g;
    if (!pattern.test(value)) return value;
    pattern.lastIndex = 0;
    return value.replace(pattern, (_, name) => secrets[name] ?? `{${name}}`);
  }

  if (Array.isArray(value)) {
    return value.map((item) => interpolateValue(item, secrets));
  }

  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(
      value as Record<string, unknown>,
    )) {
      result[k] = interpolateValue(v, secrets);
    }
    return result;
  }

  return value;
}

export function loadConfig(projectRoot: string): OmnibaseConfig {
  const configPath = findConfigFile(projectRoot);

  if (!configPath) {
    return { deployments: [] };
  }

  try {
    const parsed = parseConfigFile(configPath);
    const rawDeployments = (parsed.deployments as
      | Array<Record<string, unknown>>
      | undefined) ?? [];
    const rawLocal = parsed.local as { env_path?: string } | undefined;

    return {
      project_id: parsed.project_id as string | undefined,
      deployments: rawDeployments.map((d) => ({
        name: String(d.name ?? ""),
        path: d.path as string | undefined,
        port: d.port as number | undefined,
      })),
      auth: parsed.auth as AuthConfig | undefined,
      local: rawLocal,
      env: parsed.env as Record<string, string> | undefined,
      versions: parsed.versions as Record<string, string> | undefined,
    };
  } catch (error) {
    console.warn(`Warning: Could not parse config file at ${configPath}`);
    return { deployments: [] };
  }
}

export function getResolvedConfig(
  projectRoot: string,
  envName?: string,
): OmnibaseConfig {
  const config = loadConfig(projectRoot);
  const secrets = loadSecretsMap(
    projectRoot,
    envName,
    config.local?.env_path,
  );
  return interpolateValue(config, secrets) as OmnibaseConfig;
}

/**
 * Sections pushed to the cloud: everything except [local] and the keys the CLI
 * uses to find the branch and the worker bundles.
 */
const CLI_ONLY_KEYS = new Set(["local", "project_id", "deployments"]);

export function cloudConfigOf(
  config: OmnibaseConfig,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config)) {
    if (!CLI_ONLY_KEYS.has(key) && value !== undefined) {
      out[key] = value;
    }
  }
  return out;
}

/**
 * A provider is enabled by OIDC_<PROVIDER>_ENABLED, with credentials in
 * <PROVIDER>_CLIENT_ID / <PROVIDER>_CLIENT_SECRET.
 */
function oidcEnvOf(providers: OidcProviderConfig[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of providers) {
    if (!p.provider) continue;
    const key = p.provider.toUpperCase();
    out[`OIDC_${key}_ENABLED`] = "true";
    if (p.client_id) out[`${key}_CLIENT_ID`] = p.client_id;
    if (p.client_secret) out[`${key}_CLIENT_SECRET`] = p.client_secret;
  }
  return out;
}

/**
 * Flatten config into the env vars the local containers expect, so
 * `omnibase start` honours the same omnibase.toml the cloud does. Values must
 * already be interpolated.
 */
export function localEnvFromConfig(
  config: OmnibaseConfig,
): Record<string, string> {
  const out: Record<string, string> = {};

  const auth = config.auth;
  if (auth) {
    if (auth.website_url) out.WEBSITE_URL = auth.website_url;
    if (auth.allowed_return_urls?.length) {
      const urls = auth.allowed_return_urls
        .map((u) => u.trim())
        .filter((u) => u.length > 0);
      if (urls.length) out.ALLOWED_RETURN_URLS = urls.join(",");
    }
    if (auth.cookie_secret) out.COOKIE_SECRET = auth.cookie_secret;
    // Kratos rejects anything but lowercase levels.
    if (auth.log_level) out.AUTH_LOG_LEVEL = auth.log_level.toLowerCase();
    if (auth.oidc) Object.assign(out, oidcEnvOf(auth.oidc));
  }

  const env = config.env;
  if (env && typeof env === "object") {
    for (const [k, v] of Object.entries(env as Record<string, unknown>)) {
      if (typeof v === "string") out[k] = v;
    }
  }

  return out;
}
