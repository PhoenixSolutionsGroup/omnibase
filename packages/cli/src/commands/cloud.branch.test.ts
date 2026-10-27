import { describe, expect, test } from "bun:test";
import {
  buildBranchEnv,
  findLiveBranchByName,
  isGoneBranchStatus,
  pickLiveBranch,
  stripUnresolvedOidcProviders,
  unwrapManagedHostingData,
} from "./cloud";

test("stripUnresolvedOidcProviders drops providers with unresolved credentials", () => {
  const payload = {
    auth: {
      website_url: "https://example.com",
      oidc: [
        { provider: "google", client_id: "{GOOGLE_CLIENT_ID}", client_secret: "{GOOGLE_CLIENT_SECRET}" },
        { provider: "github", client_id: "gh", client_secret: "secret" },
      ],
    },
  };

  expect(stripUnresolvedOidcProviders(payload)).toEqual(["google"]);
  expect(payload.auth.oidc).toEqual([
    { provider: "github", client_id: "gh", client_secret: "secret" },
  ]);
});

test("stripUnresolvedOidcProviders removes the oidc key when none remain", () => {
  const payload = {
    auth: {
      oidc: [{ provider: "google", client_id: "{GOOGLE_CLIENT_ID}" }],
    },
  };

  expect(stripUnresolvedOidcProviders(payload)).toEqual(["google"]);
  expect("oidc" in payload.auth).toBe(false);
});

test("unwrapManagedHostingData accepts wrapped and raw responses", () => {
  expect(unwrapManagedHostingData({ data: { tenant_id: "t1" } })).toEqual({
    tenant_id: "t1",
  });
  expect(unwrapManagedHostingData({ tenant_id: "t1" })).toEqual({
    tenant_id: "t1",
  });
});

const branches = [
  { id: "1", name: "pr-1", slug: "abc", status: "deleted" },
  { id: "2", name: "pr-1", slug: "def", status: "active" },
  { id: "3", name: "pr-2", slug: "ghi", status: "provisioning" },
];

describe("branch selection", () => {
  test("deleted and deleting branches are gone", () => {
    expect(isGoneBranchStatus("deleted")).toBe(true);
    expect(isGoneBranchStatus("deleting")).toBe(true);
    expect(isGoneBranchStatus("active")).toBe(false);
  });

  test("findLiveBranchByName prefers the newest live branch", () => {
    expect(findLiveBranchByName(branches, "pr-1")?.id).toBe("2");
    expect(findLiveBranchByName(branches, "missing")).toBeUndefined();
  });

  test("pickLiveBranch resolves by id, name, or slug and ignores deleted matches", () => {
    expect(pickLiveBranch(branches, "pr-1")?.id).toBe("2");
    expect(pickLiveBranch(branches, "def")?.id).toBe("2");
    expect(pickLiveBranch(branches, "3")?.id).toBe("3");
  });
});

describe("buildBranchEnv", () => {
  test("derives branch API and dashboard URLs from the branch host", () => {
    const env = buildBranchEnv({
      apiUrl: "https://my-project-abc.omnibase-projects.app",
      postgrestUrl: "https://my-project-abc.omnibase-projects.app/rest/v1",
      serviceKey: "svc_key",
      managedHostingUrl: "https://api.omnibase.tech",
      workerDomain: "workers.omnibase.tech",
      cookieDomain: ".omnibase.tech",
    });

    expect(env.OMNIBASE_API_URL).toBe(
      "https://my-project-abc.omnibase-projects.app",
    );
    expect(env.NEXT_PUBLIC_OMNIBASE_API_URL).toBe(
      "https://my-project-abc.omnibase-projects.app",
    );
    expect(env.OMNIBASE_POSTGREST_URL).toBe(
      "https://my-project-abc.omnibase-projects.app/rest/v1",
    );
    expect(env.NEXT_PUBLIC_WEBSITE_URL).toBe(
      "https://my-project-abc-dashboard.workers.omnibase.tech",
    );
    expect(env.OMNIBASE_SERVICE_KEY).toBe("svc_key");
    expect(env.OMNIBASE_COOKIE_DOMAIN).toBe(".omnibase.tech");
  });

  test("derives the cookie domain from the worker domain", () => {
    const env = buildBranchEnv({
      apiUrl: "https://my-project-abc.omnibase-projects.app",
      serviceKey: "svc_key",
      managedHostingUrl: "https://api.omnibase.tech",
    });

    expect(env.OMNIBASE_COOKIE_DOMAIN).toBe(".workers.omnibase.tech");
  });

  test("an explicit dashboard URL overrides the derived worker URL", () => {
    const env = buildBranchEnv({
      apiUrl: "https://my-project-abc.omnibase-projects.app",
      serviceKey: "svc_key",
      managedHostingUrl: "https://api.omnibase.tech",
      dashboardUrl: "https://dashboard.preview.example.com/",
    });

    expect(env.WEBSITE_URL).toBe("https://dashboard.preview.example.com");
    expect(env.NEXT_PUBLIC_WEBSITE_URL).toBe(
      "https://dashboard.preview.example.com",
    );
    expect(env.ALLOWED_RETURN_URLS).toBe(
      "https://dashboard.preview.example.com",
    );
  });
});
