import { Database } from "@/types/database";
import {
  Configuration,
  V1PaymentsApi,
  V1StripeApi,
  V1TenantsApi,
} from "@omnibase/core-js";
import { PostgrestClient } from "@supabase/postgrest-js";
import { cookies } from "next/headers";

const OMNIBASE_API_URL = process.env.OMNIBASE_API_URL!;

const OMNIBASE_POSTGREST_URL = process.env.OMNIBASE_POSTGREST_URL!;
const OMNIBASE_ANON_KEY = process.env.OMNIBASE_ANON_KEY!;

export const createServerClient = async () => {
  const cookieStore = await cookies();
  const key =
    cookieStore.get("omnibase_postgrest_jwt")?.value || OMNIBASE_ANON_KEY;

  return new PostgrestClient<Database>(OMNIBASE_POSTGREST_URL, {
    headers: {
      Authorization: `Bearer ${key}`,
    },
  });
};

export const createTenantsServerClient = async () => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  return new V1TenantsApi(
    new Configuration({
      basePath: OMNIBASE_API_URL,
      headers: {
        Cookie: cookieHeader,
      },
    })
  );
};

export const createPaymentsServerClient = async () => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  return new V1PaymentsApi(
    new Configuration({
      basePath: OMNIBASE_API_URL,
      headers: {
        Cookie: cookieHeader,
      },
    })
  );
};

export const createStripeServerClient = async () => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  return new V1StripeApi(
    new Configuration({
      basePath: OMNIBASE_API_URL,
      headers: {
        Cookie: cookieHeader,
      },
    })
  );
};
