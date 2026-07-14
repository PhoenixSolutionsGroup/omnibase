"use server";

import { cookies } from "next/headers";

export async function fetchPostgrestServiceKey(branchId: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const apiUrl =
    process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL || "http://localhost:8002";

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/project_branches/${branchId}/db-service-key`,
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
          error: "You do not have permission to view the PostgREST service key",
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: "PostgREST service key not yet provisioned",
        };
      }

      return {
        success: false,
        error: error.message || "Failed to fetch PostgREST service key",
      };
    }

    const data = await response.json();

    return {
      success: true,
      serviceKey: data.service_key,
    };
  } catch (error) {
    console.error("Error fetching PostgREST service key:", error);
    return {
      success: false,
      error: "Failed to connect to the server",
    };
  }
}

export async function fetchProjectSecretKey(branchId: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const apiUrl =
    process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL || "http://localhost:8002";

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/project_branches/${branchId}/api-service-key`,
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
      serviceKey: data.api_service_key,
    };
  } catch (error) {
    throw error;
  }
}

export async function fetchDatabasePassword(branchId: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const apiUrl =
    process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL || "http://localhost:8002";

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/project_branches/${branchId}/database-password`,
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
          error: "You do not have permission to view the database password",
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: "Database password not yet provisioned",
        };
      }

      return {
        success: false,
        error: error.message || "Failed to fetch database password",
      };
    }

    const data = await response.json();

    return {
      success: true,
      password: data.database_password,
    };
  } catch (error) {
    console.error("Error fetching database password:", error);
    return {
      success: false,
      error: "Failed to connect to the server",
    };
  }
}

export async function fetchDatabaseConnectionString(branchId: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const apiUrl =
    process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL || "http://localhost:8002";

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/project_branches/${branchId}/database-connection-string`,
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
          error:
            "You do not have permission to view the database connection string",
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: "Database connection string not yet provisioned",
        };
      }

      return {
        success: false,
        error: error.message || "Failed to fetch database connection string",
      };
    }

    const data = await response.json();

    return {
      success: true,
      connectionString: data.database_connection_string,
    };
  } catch (error) {
    console.error("Error fetching database connection string:", error);
    return {
      success: false,
      error: "Failed to connect to the server",
    };
  }
}

export async function fetchPostmarkServerToken(branchId: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const apiUrl =
    process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL || "http://localhost:8002";

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/project_branches/${branchId}/postmark-server-token`,
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
          error: "You do not have permission to view the Postmark server token",
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: "Postmark server token not yet provisioned",
        };
      }

      return {
        success: false,
        error: error.message || "Failed to fetch Postmark server token",
      };
    }

    const data = await response.json();

    return {
      success: true,
      token: data.postmark_server_token,
    };
  } catch (error) {
    console.error("Error fetching Postmark server token:", error);
    return {
      success: false,
      error: "Failed to connect to the server",
    };
  }
}

export async function fetchAPIServiceKey(branchId: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const apiUrl =
    process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL || "http://localhost:8002";

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/project_branches/${branchId}/api-service-key`,
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
          error: "You do not have permission to view the API service key",
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: "API service key not yet provisioned",
        };
      }

      return {
        success: false,
        error: error.message || "Failed to fetch API service key",
      };
    }

    const data = await response.json();

    return {
      success: true,
      apiServiceKey: data.api_service_key,
    };
  } catch (error) {
    console.error("Error fetching API service key:", error);
    return {
      success: false,
      error: "Failed to connect to the server",
    };
  }
}

export async function rotateProjectKeys(branchId: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const apiUrl =
    process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL || "http://localhost:8002";

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/project_branches/${branchId}/rotate-keys`,
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
    };
  } catch (error) {
    console.error("Error rotating keys:", error);
    return {
      success: false,
      error: "Failed to connect to the server",
    };
  }
}

export async function fetchStorageCredentials(branchId: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const apiUrl =
    process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL || "http://localhost:8002";

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/project_branches/${branchId}/storage-credentials`,
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
          error: "You do not have permission to view the storage credentials",
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: "Storage credentials not yet provisioned",
        };
      }

      return {
        success: false,
        error: error.message || "Failed to fetch storage credentials",
      };
    }

    const data = await response.json();

    return {
      success: true,
      accessKey: data.access_key,
      secretKey: data.secret_key,
      endpoint: data.endpoint,
      bucketName: data.bucket_name,
    };
  } catch (error) {
    console.error("Error fetching storage credentials:", error);
    return {
      success: false,
      error: "Failed to connect to the server",
    };
  }
}
