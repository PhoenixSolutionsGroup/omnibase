import { createOmniBaseMiddleware } from "@omnibase/nextjs/middleware";

const OMNIBASE_API_URL = process.env.OMNIBASE_API_URL!;

export const middleware = createOmniBaseMiddleware(OMNIBASE_API_URL, {
  tenant_check: true,
  tenant_check_paths: ["/"],
  tenant_check_redirect_url: "/auth/onboarding",
});
