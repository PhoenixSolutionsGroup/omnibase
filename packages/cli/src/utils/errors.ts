import axios from "axios";
import { logger } from "./logger";

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

export function handleCommandError(error: unknown): never {
  logger.fail(formatHttpError(error));
  process.exit(1);
}
