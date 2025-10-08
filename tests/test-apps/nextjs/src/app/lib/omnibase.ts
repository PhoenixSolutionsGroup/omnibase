import { OmnibaseClient } from "@omnibase/core-js";
import { createClient } from "@omnibase/core-js/database";

export const omnibase = new OmnibaseClient({
  api_url: process.env.NEXT_PUBLIC_OMNIBASE_API_URL!,
  fetch: (endpoint, options) => {
    return fetch(endpoint, {
      ...options,
      credentials: "include",
    });
  },
});

// Create database client with cookie-based authentication
export const db = createClient(`http://127.0.0.1:8001`, "anon", (name) => {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1] || ""
  );
});
