import * as fs from "fs";
import * as path from "path";
import * as TOML from "smol-toml";

export interface OmnibaseOidcProvider {
  provider: string;
  client_id?: string;
  client_secret?: string;
}

export interface OmnibaseAuthConfig {
  website_url?: string;
  cookie_secret?: string;
  log_level?: string;
  oidc?: OmnibaseOidcProvider[];
}

export interface OmnibaseDeployment {
  name: string;
  path: string;
}

/**
 * Local-development-only config. Never sent to the cloud — this is where
 * Stripe lives, since managed hosting owns Stripe env via the Connect account
 * it provisions per branch.
 */
export interface OmnibaseLocalConfig {
  env_path?: string;
  stripe?: Record<string, string>;
  [key: string]: unknown;
}

export interface OmnibaseTomlConfig {
  project_id?: string;
  deployments?: OmnibaseDeployment[];
  auth?: OmnibaseAuthConfig;
  local?: OmnibaseLocalConfig;
  [key: string]: unknown;
}

/**
 * Keys that stay on the CLI side: `local` is local-dev-only, while
 * `project_id` and `deployments` are how the CLI finds the branch and the
 * worker bundles — none of them are deployment config.
 */
const CLI_ONLY_KEYS = new Set(["local", "project_id", "deployments"]);

/**
 * The portion of the config that gets pushed to the cloud: everything except
 * [local] and the CLI-side keys.
 */
export function cloudConfigOf(cfg: OmnibaseTomlConfig): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(cfg)) {
    if (!CLI_ONLY_KEYS.has(key) && value !== undefined) {
      out[key] = value;
    }
  }
  return out;
}

/**
 * A source for {VAR} resolution. `process.env` is accepted directly.
 */
export type VarSource = Record<string, string | undefined>;

/**
 * Path to the omnibase.toml for a project root, or null if absent.
 */
export function findOmnibaseConfigPath(root: string): string | null {
  const p = path.join(root, "omnibase", "omnibase.toml");
  return fs.existsSync(p) ? p : null;
}

/**
 * Parse omnibase/omnibase.toml into a structured config. Returns {} if absent.
 * Interpolation of {VAR} is NOT done here — call interpolate() with the
 * caller-appropriate sources (cloud vs local).
 */
export function loadOmnibaseConfig(root: string): OmnibaseTomlConfig {
  const configPath = findOmnibaseConfigPath(root);
  if (!configPath) {
    return {};
  }
  const text = fs.readFileSync(configPath, "utf-8");
  return TOML.parse(text) as OmnibaseTomlConfig;
}

/**
 * Env vars the auth (Kratos) image derives its config from. A provider is
 * enabled by OIDC_<PROVIDER>_ENABLED, with credentials in
 * <PROVIDER>_CLIENT_ID / <PROVIDER>_CLIENT_SECRET.
 */
function oidcEnvOf(providers: OmnibaseOidcProvider[]): Record<string, string> {
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
 * Flatten the cloud-bound config into the env vars the local containers
 * expect, so `omnibase start` honours the same omnibase.toml the cloud does.
 * Values must already be interpolated.
 */
export function localEnvFromConfig(
  cfg: OmnibaseTomlConfig
): Record<string, string> {
  const out: Record<string, string> = {};

  const auth = cfg.auth;
  if (auth) {
    if (auth.website_url) out.WEBSITE_URL = auth.website_url;
    if (auth.cookie_secret) out.COOKIE_SECRET = auth.cookie_secret;
    // Kratos rejects anything but lowercase levels.
    if (auth.log_level) out.AUTH_LOG_LEVEL = auth.log_level.toLowerCase();
    if (auth.oidc) Object.assign(out, oidcEnvOf(auth.oidc));
  }

  const env = cfg.env;
  if (env && typeof env === "object") {
    for (const [k, v] of Object.entries(env as Record<string, unknown>)) {
      if (typeof v === "string") out[k] = v;
    }
  }

  return out;
}

const VAR_PATTERN = /\{([A-Za-z_][A-Za-z0-9_]*)\}/g;

function resolveVar(name: string, sources: VarSource[]): string | undefined {
  for (const source of sources) {
    const value = source[name];
    if (value !== undefined && value !== "") {
      return value;
    }
  }
  return undefined;
}

/**
 * Recursively replace {VAR} in every string of `value`. `sources` is an
 * ordered list of resolvers — first non-empty match wins; if none match the
 * literal {VAR} is left intact and the name is collected in `missing`.
 *
 * The caller supplies the source order per command context (e.g. cloud passes
 * [process.env, fromEnvFile]; local dev passes [process.env, dotEnvLocal]).
 * This function never reads any file itself.
 */
export function interpolate<T>(
  value: T,
  sources: VarSource[],
  missing?: Set<string>
): T {
  if (typeof value === "string") {
    return value.replace(VAR_PATTERN, (match, name: string) => {
      const resolved = resolveVar(name, sources);
      if (resolved === undefined) {
        missing?.add(name);
        return match;
      }
      return resolved;
    }) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => interpolate(v, sources, missing)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = interpolate(v, sources, missing);
    }
    return out as unknown as T;
  }
  return value;
}
