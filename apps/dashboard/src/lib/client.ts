import { createClient } from "@omnibase/core-js/database";

const OMNIBASE_POSTGREST_URL = process.env.NEXT_PUBLIC_OMNIBASE_POSTGREST_URL!;
const OMNIBASE_ANON_KEY = process.env.NEXT_PUBLIC_OMNIBASE_ANON_KEY!;

export const createBrowserClient = () => {
  return createClient(
    OMNIBASE_POSTGREST_URL,
    OMNIBASE_ANON_KEY,
    (cookie: string) => {
      // Get cookie value from document.cookie
      const match = document.cookie.match(
        new RegExp("(^| )" + cookie + "=([^;]+)")
      );
      return match ? match[2] : "";
    }
  );
};
