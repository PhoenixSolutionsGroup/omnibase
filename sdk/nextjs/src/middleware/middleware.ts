const OMNIBASE_AUTH_URL = process.env.OMNIBASE_AUTH_URL;
if (!OMNIBASE_AUTH_URL)
  throw new Error("OMNIBASE_AUTH_URL must be set in environment variables");

// Environment variable polyfill for Ory SDK
if (typeof globalThis !== "undefined" && !process.env.NEXT_PUBLIC_ORY_SDK_URL) {
  process.env.NEXT_PUBLIC_ORY_SDK_URL = process.env.OMNIBASE_AUTH_URL;
}

import { createOryMiddleware } from "@ory/nextjs/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "../auth";

/**
 * Configuration options for the OmniBase middleware
 *
 * This interface defines the configuration for tenant checking behavior
 * in the Next.js middleware. It controls whether tenant validation is
 * enabled, which paths require tenant membership, and where to redirect
 * users who are not part of a tenant.
 *
 * @example
 * ```typescript
 * const config: OmnibaseMiddlewareConfig = {
 *   tenant_check: true,
 *   tenant_check_paths: ['/dashboard/*', '/settings'],
 *   tenant_check_redirect_url: '/onboarding'
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Middleware
 */
type OmnibaseMiddlewareConfig = {
  /**
   * Enable or disable tenant membership checking
   * @defaultValue true
   */
  tenant_check: boolean;

  /**
   * Array of path patterns that require tenant membership
   * Supports exact matches and wildcard patterns (e.g., '/dashboard/*')
   * @defaultValue ['/']
   */
  tenant_check_paths: string[];

  /**
   * URL to redirect users who are not part of a tenant
   * @defaultValue '/auth/onboarding'
   */
  tenant_check_redirect_url: string;
};

const defaultConfig: OmnibaseMiddlewareConfig = {
  tenant_check: true,
  tenant_check_paths: ["/"],
  tenant_check_redirect_url: "/auth/onboarding",
};

/**
 * Creates a Next.js middleware function with authentication and tenant checking
 *
 * This middleware combines Ory authentication with OmniBase tenant validation.
 * It intercepts incoming requests to verify user authentication via Ory, and
 * optionally checks if authenticated users belong to a tenant before allowing
 * access to protected routes.
 *
 * The middleware performs the following checks in order:
 * 1. Delegates authentication to Ory middleware
 * 2. Checks if the current path requires tenant membership
 * 3. Validates that the authenticated user belongs to a tenant
 * 4. Redirects non-tenant users to an onboarding page
 *
 * Path matching supports both exact matches and wildcard patterns:
 * - Exact: '/dashboard' matches only '/dashboard'
 * - Prefix: '/dashboard' also matches '/dashboard/settings'
 * - Wildcard: '/api/*' matches all paths starting with '/api/'
 *
 * @param config - Configuration object for middleware behavior
 * @param config.tenant_check - Enable tenant membership validation
 * @param config.tenant_check_paths - Paths requiring tenant membership
 * @param config.tenant_check_redirect_url - Redirect destination for non-tenant users
 *
 * @returns Next.js middleware function that can be exported from middleware.ts
 *
 * @example
 * Basic usage with default configuration:
 * ```typescript
 * import { createOmniBaseMiddleware } from '@omnibase/nextjs/middleware';
 *
 * export default createOmniBaseMiddleware();
 *
 * export const config = {
 *   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
 * };
 * ```
 *
 * @example
 * Custom configuration with specific protected paths:
 * ```typescript
 * import { createOmniBaseMiddleware } from '@omnibase/nextjs/middleware';
 *
 * export default createOmniBaseMiddleware({
 *   tenant_check: true,
 *   tenant_check_paths: [
 *     '/dashboard/*',
 *     '/projects/*',
 *     '/settings'
 *   ],
 *   tenant_check_redirect_url: '/onboarding/create-tenant'
 * });
 * ```
 *
 * @example
 * Disable tenant checking for specific deployments:
 * ```typescript
 * import { createOmniBaseMiddleware } from '@omnibase/nextjs/middleware';
 *
 * export default createOmniBaseMiddleware({
 *   tenant_check: false,
 *   tenant_check_paths: [],
 *   tenant_check_redirect_url: '/auth/onboarding'
 * });
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Middleware
 */
export const createOmniBaseMiddleware = ({
  tenant_check,
  tenant_check_paths,
  tenant_check_redirect_url,
}: OmnibaseMiddlewareConfig = defaultConfig) => {
  const oryMiddleware = createOryMiddleware({});
  return async (req: NextRequest) => {
    if (!tenant_check) return oryMiddleware(req);

    const pathname = req.nextUrl.pathname;

    const shouldCheckTenant = tenant_check_paths.some((pattern) => {
      if (pattern.endsWith("/*")) {
        return pathname.startsWith(pattern.slice(0, -2));
      }
      return pathname === pattern || pathname.startsWith(pattern + "/");
    });

    if (!shouldCheckTenant) {
      return oryMiddleware(req);
    }

    const session = await getServerSession();
    if (!session || !session.active) return oryMiddleware(req);

    const metadata_public = session.identity?.metadata_public as any;
    const is_in_tenant = metadata_public?.is_in_tenant;

    if (!is_in_tenant) {
      return NextResponse.redirect(new URL(tenant_check_redirect_url, req.url));
    }

    return oryMiddleware(req);
  };
};
