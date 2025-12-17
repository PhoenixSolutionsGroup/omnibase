"use server";

import { cookies } from "next/headers";

const MANAGED_HOSTING_API_URL = process.env.MANAGED_HOSTING_API_URL;

if (!MANAGED_HOSTING_API_URL) {
  throw new Error("MANAGED_HOSTING_API_URL is not set");
}

interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
  is_active: boolean;
}

interface CreateAPIKeyResponse {
  id: string;
  name: string;
  key: string; // Full key - only returned on creation
  key_prefix: string;
  created_at: string;
  expires_at?: string;
}

export async function createAPIKey(name: string, expiresAt?: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const body: { name: string; expires_at?: string } = { name };
  if (expiresAt) {
    body.expires_at = expiresAt;
  }

  const response = await fetch(`${MANAGED_HOSTING_API_URL}/api/v1/api-keys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create API key");
  }

  const data: CreateAPIKeyResponse = await response.json();
  return data;
}

export async function listAPIKeys() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch(`${MANAGED_HOSTING_API_URL}/api/v1/api-keys`, {
    method: "GET",
    headers: {
      Cookie: cookieHeader,
    },
  });

  const data = await response.json();

  // Handle 403 Forbidden - user doesn't have permission to view API keys
  if (response.status === 403) {
    return {
      hasPermission: false,
      api_keys: [],
    };
  }

  // Handle other error responses
  if (!response.ok) {
    throw new Error(data.error || "Failed to list API keys");
  }

  // Success case - return api_keys with permission flag
  return {
    hasPermission: true,
    api_keys: data.api_keys as APIKey[],
  };
}

export async function revokeAPIKey(apiKeyId: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch(
    `${MANAGED_HOSTING_API_URL}/api/v1/api-keys/${apiKeyId}`,
    {
      method: "DELETE",
      headers: {
        Cookie: cookieHeader,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to revoke API key");
  }

  const data = await response.json();
  return data;
}
