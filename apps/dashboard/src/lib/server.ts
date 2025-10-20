import { OmnibaseClient } from "@omnibase/core-js";
import { cookies } from "next/headers";

const OMNIBASE_API_URL = process.env.OMNIBASE_API_URL!;

export const client = new OmnibaseClient({
  api_url: OMNIBASE_API_URL,
  fetch: async (endpoint, options) => {
    const cookieStore = await cookies();

    const cookieHeader = Array.from(cookieStore.getAll())
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");
    return fetch(endpoint, {
      ...options,
      headers: {
        Cookie: cookieHeader,
        ...options.headers,
      },
    });
  },
});
