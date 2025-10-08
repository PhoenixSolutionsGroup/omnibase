import { OmnibaseClient } from "@omnibase/core-js";
import { createClient } from "@omnibase/core-js/database";
import { cookies, headers } from "next/headers";

export const omnibase = new OmnibaseClient({
  api_url: process.env.NEXT_PUBLIC_OMNIBASE_API_URL!,
  fetch: async (endpoint, options) => {
    const cookieStore = await cookies();

    // Convert cookies to raw header format (not URL-encoded)
    const cookieHeader = Array.from(cookieStore.getAll())
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    console.log(endpoint);
    console.log(options);
    return fetch(endpoint, {
      ...options,
      credentials: "include",
      headers: {
        Cookie: cookieHeader,
        ...options.headers,
      },
    });
  },
});

// Create a function that returns a database client for server-side usage
export const getDb = async () => {
  const cookieStore = await cookies();
  return createClient(`http://127.0.0.1:8001`, "anon", (name) => {
    return cookieStore.get(name)?.value || "";
  });
};
