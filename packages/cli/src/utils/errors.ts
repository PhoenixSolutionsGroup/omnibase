import axios from "axios";
import { ResponseError } from "@omnibase/core-js";
import { logger } from "./logger";

export async function extractApiError(error: unknown): Promise<string> {
  if (error instanceof ResponseError) {
    try {
      const body = await error.response.json();
      return (
        body.error ||
        body.message ||
        body.detail ||
        `${error.response.status} - ${error.response.statusText}`
      );
    } catch {
      return `${error.response.status} - ${error.response.statusText}`;
    }
  }

  return formatHttpError(error);
}

export function formatHttpError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || "Unknown";
    const data = error.response?.data;

    const apiMessage = data?.error || data?.message || data?.detail;

    if (apiMessage) {
      return `${status} - ${apiMessage}`;
    }

    const statusText = error.response?.statusText || "Request failed";
    return `${status} - ${statusText}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error occurred";
}

export async function handleCommandError(error: unknown): Promise<never> {
  logger.fail(await extractApiError(error));
  process.exit(1);
}
