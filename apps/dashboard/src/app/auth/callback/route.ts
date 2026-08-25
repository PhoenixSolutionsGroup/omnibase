import { createSessionTokenExchangeHandler } from "@omnibase/nextjs/auth";

export const GET = createSessionTokenExchangeHandler({
  api_url: process.env.NEXT_PUBLIC_OMNIBASE_API_URL!,
  success_path: "/",
});