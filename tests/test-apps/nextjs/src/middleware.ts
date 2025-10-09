import { createOmniBaseMiddleware } from "@omnibase/nextjs/middleware";

export const middleware = createOmniBaseMiddleware(
  process.env.NEXT_PUBLIC_OMNIBASE_API_URL!
);
