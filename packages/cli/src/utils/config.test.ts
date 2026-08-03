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
    // Cloud builds its secrets map from process.env + --from-env only; a
    // .env.local value must never make it into that map.
    const cloudSecrets = { FOO: "from-flag" };
    expect(interpolateValue("{FOO}", cloudSecrets)).toBe("from-flag");
    expect(interpolateValue("{FOO}", cloudSecrets)).not.toBe(
      "from-local-DO-NOT-USE"
    );
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
