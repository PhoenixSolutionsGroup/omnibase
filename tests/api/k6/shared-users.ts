import http from "k6/http";
import { BASE_URL, SERVICE_KEY } from "./client";

declare const __VU: number;

export interface SharedUser {
  id: string;
  email: string;
  password: string;
}

export interface SetupData {
  users: SharedUser[];
  usersPerVU: number;
}

interface UserRequest {
  email: string;
  password: string;
  index: number;
}

/**
 * Creates a pool of pre-created users for stress testing.
 * This runs once in k6's setup() phase, BEFORE any VU iterations.
 *
 * Creates 2 users per VU so each VU has dedicated users:
 * - VU 1 gets users[0] and users[1]
 * - VU 2 gets users[2] and users[3]
 * - etc.
 *
 * By pre-creating users, we avoid the expensive bcrypt password hashing
 * during the actual stress test iterations. Tenant creation is fast
 * (no bcrypt), so tests should create new tenants but reuse these users.
 *
 * Users are created in batches of 5 concurrently to speed up setup.
 */
export function createSharedUsers(vuCount: number): SetupData {
  const users: SharedUser[] = [];
  const baseId = Date.now().toString();
  const usersPerVU = 2;
  const totalUsers = vuCount * usersPerVU;
  const batchSize = 10;

  console.log(
    `[setup] Creating ${totalUsers} users (${usersPerVU} per VU, ${vuCount} VUs) in batches of ${batchSize}`,
  );

  // Prepare all user requests
  const userRequests: UserRequest[] = [];
  for (let i = 0; i < totalUsers; i++) {
    userRequests.push({
      email: `stress-user-${baseId}-${i}@example.com`,
      password: crypto.randomUUID(),
      index: i,
    });
  }

  // Process in batches of 5
  for (let batchStart = 0; batchStart < totalUsers; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize, totalUsers);
    const batch = userRequests.slice(batchStart, batchEnd);

    // Build batch request array for k6
    const batchRequests = batch.map((req) => ({
      method: "POST" as const,
      url: `${BASE_URL}/api/v1/auth/users`,
      body: JSON.stringify({
        email: req.email,
        password: req.password,
        name: {
          first: "Stress",
          last: `User${req.index}`,
        },
      }),
      params: {
        headers: {
          "Content-Type": "application/json",
          "X-Service-Key": SERVICE_KEY,
        },
      },
    }));

    // Execute batch concurrently
    const responses = http.batch(batchRequests);

    // Process responses
    responses.forEach((response, i) => {
      const req = batch[i]!;

      if (response.status === 200) {
        try {
          const body = response.json() as { data?: { id: string } };
          if (body.data?.id) {
            users.push({
              id: body.data.id,
              email: req.email,
              password: req.password,
            });
          }
        } catch (e) {
          console.error(
            `[setup] Failed to parse response for user ${req.index}`,
          );
        }
      } else {
        console.error(
          `[setup] Failed to create user ${req.index}: ${response.status}`,
        );
      }
    });

    console.log(
      `[setup] Created batch ${Math.floor(batchStart / batchSize) + 1}/${Math.ceil(totalUsers / batchSize)} (${users.length}/${totalUsers} users)`,
    );
  }

  console.log(
    `[setup] Created ${users.length} shared users for stress testing`,
  );
  return { users, usersPerVU };
}

/**
 * Get this VU's primary user (index 0).
 * Each VU has dedicated users so there's no contention.
 */
export function getMyUser(data: SetupData): SharedUser {
  const baseIndex = (__VU - 1) * data.usersPerVU;
  const user = data.users[baseIndex];
  if (!user) {
    throw new Error(
      `No user found for VU ${__VU} at index ${baseIndex}. Did setup() create enough users?`,
    );
  }
  return user;
}

/**
 * Get this VU's secondary user (index 1).
 * Useful for tests that need two distinct users (e.g., cross-tenant isolation).
 */
export function getMySecondUser(data: SetupData): SharedUser {
  const baseIndex = (__VU - 1) * data.usersPerVU;
  const user = data.users[baseIndex + 1];
  if (!user) {
    throw new Error(
      `No second user found for VU ${__VU} at index ${baseIndex + 1}. Did setup() create enough users?`,
    );
  }
  return user;
}

/**
 * Get both users for this VU as a tuple.
 * Useful for tests that need two distinct users.
 */
export function getMyUsers(data: SetupData): [SharedUser, SharedUser] {
  return [getMyUser(data), getMySecondUser(data)];
}
