import type { Response } from "k6/http";
import { OmnibaseRESTAPIClient } from "./sdk";

declare const __VU: number;
declare const __ITER: number;

export const BASE_URL = __ENV.API_URL || "http://localhost:8080";

export function uniqueId(): string {
  return `${Date.now()}-${__VU}-${__ITER}`;
}

/**
 * Generate a random password string for k6 tests.
 * k6 doesn't have crypto.randomUUID(), so we use a simple alternative.
 */
export function randomPassword(): string {
  return `pwd-${Date.now()}-${__VU}-${__ITER}-${Math.random().toString(36).substring(2, 15)}`;
}
export const SERVICE_KEY = __ENV.SERVICE_KEY || "VERY_SECRET_KEY";

export const client = new OmnibaseRESTAPIClient({
  baseUrl: BASE_URL,
  commonRequestParameters: {
    headers: {
      "X-Service-Key": SERVICE_KEY,
    },
  },
});

export const createClient = (headers?: Record<string, string>) => {
  return new OmnibaseRESTAPIClient({
    baseUrl: BASE_URL,
    commonRequestParameters: {
      headers: {
        "X-Service-Key": SERVICE_KEY,
        ...headers,
      },
    },
  });
};

/**
 * Logs detailed error information for failed API calls.
 * Use this instead of generic "X creation failed" messages to get actionable debug info.
 */
export function logError(operation: string, response: Response): void {
  const errorDetails = {
    operation,
    status: response.status,
    statusText: response.status_text,
    url: response.url,
    body: (() => {
      try {
        return response.json();
      } catch {
        return response.body;
      }
    })(),
    timings: {
      duration: response.timings.duration,
      blocked: response.timings.blocked,
      connecting: response.timings.connecting,
    },
  };
  console.error(`[${operation}] Failed - Status: ${response.status}`);
  console.error(`[${operation}] URL: ${response.url}`);
  console.error(`[${operation}] Response: ${JSON.stringify(errorDetails.body)}`);
  if (response.timings.connecting > 100) {
    console.error(
      `[${operation}] Slow connection: ${response.timings.connecting}ms`
    );
  }
}
