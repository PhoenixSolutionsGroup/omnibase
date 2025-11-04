import { Database } from "@/types/database";
import { OmnibaseClient } from "@omnibase/core-js";
import { createClient } from "@omnibase/core-js/database";
import { cookies } from "next/headers";

const OMNIBASE_API_URL = process.env.OMNIBASE_API_URL!;

export const omnibase = new OmnibaseClient({
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

const OMNIBASE_POSTGREST_URL = process.env.OMNIBASE_POSTGREST_URL!;
const OMNIBASE_ANON_KEY = process.env.OMNIBASE_ANON_KEY!;

export const createServerClient = async () => {
  const cookieStore = await cookies();

  return createClient<Database>(
    OMNIBASE_POSTGREST_URL,
    OMNIBASE_ANON_KEY,
    (cookie: string) => {
      return cookieStore.get(cookie)?.value || "";
    }
  );
};
