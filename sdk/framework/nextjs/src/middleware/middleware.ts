import { createOryMiddleware } from "@ory/nextjs/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "../auth";
import { tenantCheckMiddleware } from "./tenant_check";
import { postgrestJWTCheckMiddleware } from "./postgrest";

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
 * @since 0.5.1
 * @public
 * @group Middleware
 */
export type OmnibaseMiddlewareConfig = {
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
 * This middleware combines Ory authentication with OmniBase tenant validation
 * and PostgREST JWT management. It intercepts incoming requests to verify user
 * authentication via Ory, optionally checks if authenticated users belong to a
 * tenant, and ensures PostgREST JWT tokens are available for database access.
 *
 * The middleware performs the following operations in order:
 * 1. Retrieves the current user session
 * 2. Validates tenant membership for configured paths (if enabled)
 * 3. Ensures PostgREST JWT token is available for database access
 * 4. Delegates remaining authentication to Ory middleware
 * 5. Merges cookies from all middleware operations
 *
 * Path matching supports both exact matches and wildcard patterns:
 * - Exact: '/dashboard' matches only '/dashboard'
 * - Prefix: '/dashboard' also matches '/dashboard/settings'
 * - Wildcard: '/api/*' matches all paths starting with '/api/'
 *
 * @param api_url - The OmniBase API URL (typically from NEXT_PUBLIC_OMNIBASE_API_URL)
 * @param config - Configuration object for middleware behavior (optional)
 * @param config.tenant_check - Enable tenant membership validation (default: true)
 * @param config.tenant_check_paths - Paths requiring tenant membership (default: ['/'])
 * @param config.tenant_check_redirect_url - Redirect destination for non-tenant users (default: '/auth/onboarding')
 *
 * @returns Next.js middleware function that can be exported from middleware.ts
 *
 * @example
 * ```typescript
 * // middleware.ts - Basic usage with default configuration
 * import { createOmniBaseMiddleware } from '@omnibase/nextjs/middleware';
 *
 * export const middleware = createOmniBaseMiddleware(
 *   process.env.NEXT_PUBLIC_OMNIBASE_API_URL!
 * );
 *
 * export const config = {
 *   matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
 * };
 * ```
 *
 * @since 0.5.1
 * @public
 * @group Middleware
 */
export const createOmniBaseMiddleware = (
  api_url: string,
  config: OmnibaseMiddlewareConfig = defaultConfig
) => {
  const oryMiddleware = createOryMiddleware({});
  return async (req: NextRequest) => {
    const session = await getServerSession();

    const tenantResponse = tenantCheckMiddleware(req, session, config);
    if (tenantResponse.status !== 200) return tenantResponse;

    const jwtResponse = await postgrestJWTCheckMiddleware(
      req,
      session,
      api_url
    );
    if (jwtResponse.status !== 200) return jwtResponse;

    const oryResponse = await oryMiddleware(req);
    jwtResponse.cookies.getAll().forEach((cookie) => {
      oryResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return oryResponse;
  };
};
