import { OmnibaseRESTAPIClient } from "./sdk";

export const BASE_URL = __ENV.API_URL || "http://localhost:8080";
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
