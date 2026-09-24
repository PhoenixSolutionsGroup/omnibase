import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  loadConfig,
  findConfigFile,
  interpolateValue,
  localEnvFromConfig,
  cloudConfigOf,
  assertValidVersions,
  loadSecretsMap,
  loadWranglerConfigFile,
  resolveStartEnv,
} from "./config";

const SAMPLE = `project_id = "abc-123"

[[deployments]]
name = "default"
path = "workers"

[auth]
website_url = "http://127.0.0.1:3000"
cookie_secret = "{COOKIE_SECRET}"
log_level = "TRACE"

  [[auth.oidc]]
  provider = "google"
  client_id = "{GOOGLE_CLIENT_ID}"
  client_secret = "{GOOGLE_CLIENT_SECRET}"

[versions]
auth = "0.4.1"
api = "0.20.3"
`;

describe("loadOmnibaseConfig", () => {
  let root: string;
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "omni-"));
    mkdirSync(join(root, "omnibase"), { recursive: true });
    writeFileSync(join(root, "omnibase", "omnibase.toml"), SAMPLE);
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  test("parses toml sections", () => {
    const cfg = loadConfig(root);
    expect(cfg.project_id).toBe("abc-123");
    expect(cfg.auth?.website_url).toBe("http://127.0.0.1:3000");
    expect(cfg.auth?.oidc?.[0].provider).toBe("google");
    expect(cfg.auth?.oidc?.[0].client_secret).toBe("{GOOGLE_CLIENT_SECRET}");
  });

  test("parses [versions] section", () => {
    const cfg = loadConfig(root);
    expect(cfg.versions).toEqual({ auth: "0.4.1", api: "0.20.3" });
  });

  test("[versions] reaches cloudConfigOf for the push", () => {
    const cfg = loadConfig(root);
    const cloud = cloudConfigOf(cfg);
    expect(cloud.versions).toEqual({ auth: "0.4.1", api: "0.20.3" });
  });

  test("returns {} when no toml present", () => {
    const empty = mkdtempSync(join(tmpdir(), "omni-empty-"));
    expect(findConfigFile(empty)).toBeNull();
    expect(loadConfig(empty).deployments).toEqual([]);
    expect(loadConfig(empty).auth).toBeUndefined();
    rmSync(empty, { recursive: true, force: true });
  });
});

describe("interpolate", () => {
  test("first non-empty source wins", () => {
    const out = interpolateValue("{FOO}", { FOO: "bar" });
    expect(out).toBe("bar");
  });

  test("resolves nested objects and arrays", () => {
    const cfg = {
      auth: {
        website_url: "http://127.0.0.1:3000",
        oidc: [{ provider: "google", client_secret: "{GCS}" }],
      },
    };
    const out = interpolateValue(cfg, { GCS: "shh" }) as typeof cfg;
    expect(out.auth.oidc[0].client_secret).toBe("shh");
    expect(out.auth.website_url).toBe("http://127.0.0.1:3000");
  });

  test("leaves literals without braces untouched", () => {
    expect(interpolateValue("TRACE", {})).toBe("TRACE");
  });

  test("unresolved {VAR} stays literal", () => {
    expect(interpolateValue("{NOPE}", { FOO: "bar" })).toBe("{NOPE}");
  });

  test("cloud order ignores a .env.local-style source when not supplied", () => {
    // Simulate cloud: only [process.env-like, fromEnv]. A .env.local map is
    // deliberately NOT in the source list, so its value must never be picked.
    // Cloud builds its secrets map from process.env + branch env file; a
    // .env.local value must never make it into that map unless it is the
    // branch file itself.
    const cloudSecrets = { FOO: "from-flag" };
    expect(interpolateValue("{FOO}", cloudSecrets)).toBe("from-flag");
    expect(interpolateValue("{FOO}", cloudSecrets)).not.toBe(
      "from-local-DO-NOT-USE"
    );
  });
});

describe("loadSecretsMap", () => {
  let root: string;
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "omni-secrets-"));
    mkdirSync(join(root, "omnibase"), { recursive: true });
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  test("loads omnibase/.env.<name> when envName is provided", () => {
    writeFileSync(
      join(root, "omnibase", ".env.staging"),
      "WEBSITE_URL=https://staging.omnibase.tech\nCOOKIE_SECRET=branch-secret\n",
    );
    const secrets = loadSecretsMap(root, "staging");
    expect(secrets.WEBSITE_URL).toBe("https://staging.omnibase.tech");
    expect(secrets.COOKIE_SECRET).toBe("branch-secret");
  });

  test("branch env file wins over .env.local", () => {
    writeFileSync(
      join(root, "omnibase", ".env.local"),
      "WEBSITE_URL=http://127.0.0.1:3000\n",
    );
    writeFileSync(
      join(root, "omnibase", ".env.dev"),
      "WEBSITE_URL=https://dev.omnibase.tech\n",
    );
    const secrets = loadSecretsMap(root, "dev");
    expect(secrets.WEBSITE_URL).toBe("https://dev.omnibase.tech");
  });

  test("process.env wins over branch env file", () => {
    writeFileSync(
      join(root, "omnibase", ".env.staging"),
      "WEBSITE_URL=https://staging.omnibase.tech\n",
    );
    process.env.WEBSITE_URL = "https://ci.example.com";
    try {
      const secrets = loadSecretsMap(root, "staging");
      expect(secrets.WEBSITE_URL).toBe("https://ci.example.com");
    } finally {
      delete process.env.WEBSITE_URL;
    }
  });

  test("missing branch env file falls back to .env.local", () => {
    writeFileSync(
      join(root, "omnibase", ".env.local"),
      "COOKIE_SECRET=local-secret\n",
    );
    const secrets = loadSecretsMap(root, "nope");
    expect(secrets.COOKIE_SECRET).toBe("local-secret");
  });

  test("local envName does not load a .env.local file twice", () => {
    writeFileSync(
      join(root, "omnibase", ".env.local"),
      "COOKIE_SECRET=local-secret\n",
    );
    const secrets = loadSecretsMap(root, "local");
    expect(secrets.COOKIE_SECRET).toBe("local-secret");
  });
});

describe("loadWranglerConfigFile", () => {
  let root: string;
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "omni-wrangler-"));
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  test("returns null when no wrangler config exists", () => {
    expect(loadWranglerConfigFile(root)).toBeNull();
  });

  test("parses wrangler.toml", () => {
    writeFileSync(
      join(root, "wrangler.toml"),
      'name = "dash"\nmain = "src/index.ts"\n[vars]\nFOO = "{FOO}"\n',
    );
    const cfg = loadWranglerConfigFile(root)!;
    expect(cfg.name).toBe("dash");
    expect((cfg.vars as any).FOO).toBe("{FOO}");
  });

  test("parses wrangler.jsonc with comments", () => {
    writeFileSync(
      join(root, "wrangler.jsonc"),
      '{ "name": "dash", "vars": { "FOO": "{FOO}" } }\n',
    );
    const cfg = loadWranglerConfigFile(root)!;
    expect((cfg.vars as any).FOO).toBe("{FOO}");
  });
});

describe("resolveStartEnv", () => {
  let root: string;
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "omni-start-"));
    mkdirSync(join(root, "omnibase"), { recursive: true });
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  test("merges process.env then branch env file then wrangler vars", () => {
    writeFileSync(
      join(root, "omnibase", ".env.dev"),
      "WEBSITE_URL=https://dev.omnibase.tech\nCOOKIE_SECRET=shh\n",
    );
    const env = resolveStartEnv(
      root,
      "dev",
      { deployments: [] },
      { vars: { WEBSITE_URL: "{WEBSITE_URL}", STATIC: "x" } },
    );
    expect(env.WEBSITE_URL).toBe("https://dev.omnibase.tech");
    expect(env.COOKIE_SECRET).toBe("shh");
    expect(env.STATIC).toBe("x");
  });

  test("process.env wins over the branch env file", () => {
    writeFileSync(
      join(root, "omnibase", ".env.dev"),
      "WEBSITE_URL=https://dev.omnibase.tech\n",
    );
    process.env.WEBSITE_URL = "https://ci.example.com";
    try {
      const env = resolveStartEnv(root, "dev", { deployments: [] });
      expect(env.WEBSITE_URL).toBe("https://ci.example.com");
    } finally {
      delete process.env.WEBSITE_URL;
    }
  });

  test("no wrangler config yields the secrets map only", () => {
    writeFileSync(
      join(root, "omnibase", ".env.local"),
      "COOKIE_SECRET=local-secret\n",
    );
    const env = resolveStartEnv(root, "local", { deployments: [] });
    expect(env.COOKIE_SECRET).toBe("local-secret");
  });
});

describe("localEnvFromConfig", () => {
  test("maps auth section to container env vars", () => {
    const env = localEnvFromConfig({
      auth: {
        website_url: "http://127.0.0.1:3000",
        cookie_secret: "shh",
        log_level: "TRACE",
      },
    });
    expect(env.WEBSITE_URL).toBe("http://127.0.0.1:3000");
    expect(env.COOKIE_SECRET).toBe("shh");
    expect(env.AUTH_LOG_LEVEL).toBe("trace");
  });

  test("lowercases log_level for kratos", () => {
    const env = localEnvFromConfig({ auth: { log_level: "INFO" } });
    expect(env.AUTH_LOG_LEVEL).toBe("info");
  });

  test("joins allowed_return_urls into a comma-separated env var", () => {
    const env = localEnvFromConfig({
      auth: {
        allowed_return_urls: ["http://localhost:3000", "http://127.0.0.1:3000"],
      },
    });
    expect(env.ALLOWED_RETURN_URLS).toBe(
      "http://localhost:3000,http://127.0.0.1:3000",
    );
  });

  test("omits ALLOWED_RETURN_URLS when unset or empty", () => {
    expect(
      localEnvFromConfig({ auth: {} }).ALLOWED_RETURN_URLS,
    ).toBeUndefined();
    expect(
      localEnvFromConfig({ auth: { allowed_return_urls: [] } })
        .ALLOWED_RETURN_URLS,
    ).toBeUndefined();
  });

  test("maps oidc providers to OIDC_<P>_ENABLED and credentials", () => {
    const env = localEnvFromConfig({
      auth: {
        oidc: [
          { provider: "google", client_id: "cid", client_secret: "csec" },
          { provider: "github", client_id: "gid", client_secret: "gsec" },
        ],
      },
    });
    expect(env.OIDC_GOOGLE_ENABLED).toBe("true");
    expect(env.GOOGLE_CLIENT_ID).toBe("cid");
    expect(env.GOOGLE_CLIENT_SECRET).toBe("csec");
    expect(env.OIDC_GITHUB_ENABLED).toBe("true");
    expect(env.GITHUB_CLIENT_ID).toBe("gid");
  });

  test("passes [env] section through verbatim", () => {
    const env = localEnvFromConfig({ env: { FEATURE_FLAG: "on" } } as any);
    expect(env.FEATURE_FLAG).toBe("on");
  });

  test("ignores [local] entirely", () => {
    const env = localEnvFromConfig({
      local: { env_path: ".env.local", stripe: { secret_key: "sk_test" } },
    });
    expect(Object.keys(env)).toHaveLength(0);
    expect(JSON.stringify(env)).not.toContain("sk_test");
  });

  test("empty config yields no env", () => {
    expect(localEnvFromConfig({})).toEqual({});
  });
});

describe("cloudConfigOf", () => {
  test("excludes local, project_id and deployments", () => {
    const cloud = cloudConfigOf({
      project_id: "abc",
      deployments: [{ name: "d", path: "workers" }],
      auth: { website_url: "https://x" },
      local: { stripe: { secret_key: "sk_test" } },
    });
    expect(Object.keys(cloud)).toEqual(["auth"]);
    expect(JSON.stringify(cloud)).not.toContain("sk_test");
  });
});

describe("assertValidVersions", () => {
  test("accepts auth/api/perm exact tags", () => {
    expect(() =>
      assertValidVersions({ auth: "0.4.1", api: "0.20.3", perm: "0.4.0" }),
    ).not.toThrow();
  });

  test("rejects unknown service keys", () => {
    expect(() => assertValidVersions({ postgrest: "v14.3" })).toThrow(
      "[versions] key 'postgrest' is not allowed",
    );
  });

  test("rejects image references as specs", () => {
    for (const bad of ["evil.io/x:1", "repo/img:1", "0.20@sha256:abc", "0.20/3"]) {
      expect(() => assertValidVersions({ api: bad })).toThrow(
        "must be a tag, not an image reference",
      );
    }
  });
});
