import { createOmniBaseMiddleware } from "@omnibase/nextjs/middleware";

export const middleware = createOmniBaseMiddleware({
	tenant_check: true,
	tenant_check_paths: ["/"],
	tenant_check_redirect_url: "/auth/onboarding",
});

export const config = {
	matcher: ["/((?!_next/|favicon.ico).*)"],
};
