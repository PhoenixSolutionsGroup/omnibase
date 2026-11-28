import { createSessionTokenExchangeHandler } from "@omnibase/nextjs/auth";

const apiUrl = process.env.NEXT_PUBLIC_OMNIBASE_API_URL;
if (!apiUrl) {
	throw new Error("NEXT_PUBLIC_OMNIBASE_API_URL must be set");
}

export const GET = createSessionTokenExchangeHandler({
	api_url: apiUrl,
	success_path: "/",
	cookie_domain: process.env.OMNIBASE_COOKIE_DOMAIN,
});
