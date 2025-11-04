"use server";

import { cookies } from "next/headers";

export async function fetchProjectSecretKey(projectId: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const apiUrl =
    process.env.NEXT_PUBLIC_MANAGED_HOSTING_URL || "http://localhost:8002";

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/projects/${projectId}/secret-key`,
      {
        method: "GET",
        headers: {
          Cookie: cookieHeader,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const error = await response.json();

      if (response.status === 403) {
        return {
          success: false,
          error: "You do not have permission to view the secret key",
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: "Secret key not yet provisioned",
        };
      }

      return {
        success: false,
        error: error.message || "Failed to fetch secret key",
      };
    }

    const data = await response.json();

    return {
      success: true,
      serviceKey: data.service_key,
    };
  } catch (error) {
    console.error("Error fetching secret key:", error);
    return {
      success: false,
      error: "Failed to connect to the server",
    };
  }
}

export async function rotateProjectKeys(projectId: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const apiUrl =
    process.env.NEXT_PUBLIC_MANAGED_HOSTING_URL || "http://localhost:8002";

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/projects/${projectId}/rotate-keys`,
      {
        method: "POST",
        headers: {
          Cookie: cookieHeader,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const error = await response.json();

      if (response.status === 403) {
        return {
          success: false,
          error: "You do not have permission to rotate keys",
        };
      }

      return {
        success: false,
        error: error.message || "Failed to rotate keys",
      };
    }

    const data = await response.json();

    return {
      success: true,
      anonKey: data.anon_key,
      serviceKey: data.service_key,
    };
  } catch (error) {
    console.error("Error rotating keys:", error);
    return {
      success: false,
      error: "Failed to connect to the server",
    };
  }
}
