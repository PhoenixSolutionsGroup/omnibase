import { Database } from "@/types/omnibase";
import { PostgrestClient } from "@supabase/postgrest-js";
import Cookie from "js-cookie";

const OMNIBASE_POSTGREST_URL = process.env.NEXT_PUBLIC_OMNIBASE_POSTGREST_URL!;
const OMNIBASE_ANON_KEY = process.env.NEXT_PUBLIC_OMNIBASE_ANON_KEY!;

export const createBrowserClient = () => {
  const key = Cookie.get("omnibase_postgrest_jwt") || OMNIBASE_ANON_KEY;

  return new PostgrestClient<Database>(OMNIBASE_POSTGREST_URL, {
    headers: {
      Authorization: `Bearer ${key}`,
    },
  });
};
