import { NextResponse, type NextRequest } from "next/server";
import type { OmnibaseMiddlewareConfig } from "./middleware";
import type { Session } from "@omnibase/core-js/auth";

/**
 * Validates tenant membership for authenticated users
 *
 * This middleware function checks if an authenticated user belongs to a tenant
 * organization before allowing access to protected routes. It examines the user's
 * session metadata to determine tenant membership and redirects users without
 * tenant access to an onboarding page.
 *
 * The middleware supports flexible path matching including exact matches, prefix
 * matches, and wildcard patterns. It only performs tenant validation when both
 * the user is authenticated and the current path is configured to require tenant
 * membership.
 *
 * @param req - The Next.js request object containing the current pathname
 * @param session - The authenticated user session containing identity metadata
 * @param config - Middleware configuration object
 * @param config.tenant_check - Whether tenant validation is enabled
 * @param config.tenant_check_paths - Array of path patterns requiring tenant membership
 * @param config.tenant_check_redirect_url - Redirect URL for users without tenant access
 *
 * @returns NextResponse allowing the request to continue or redirecting to onboarding
 *
 * @example
 * ```typescript
 * import { tenantCheckMiddleware } from '@omnibase/nextjs/middleware';
 * import { getServerSession } from '@omnibase/nextjs/auth';
 *
 * // In your middleware.ts
 * const session = await getServerSession();
 * const response = tenantCheckMiddleware(req, session, {
 *   tenant_check: true,
 *   tenant_check_paths: ['/dashboard/*', '/settings'],
 *   tenant_check_redirect_url: '/onboarding'
 * });
 * ```
 *
 * @since 0.5.1
 * @public
 * @group Middleware
 */
export const tenantCheckMiddleware = (
  req: NextRequest,
  session: Session,
  {
    tenant_check,
    tenant_check_paths,
    tenant_check_redirect_url,
  }: OmnibaseMiddlewareConfig
) => {
  if (!session || !session.active || !tenant_check) return NextResponse.next();

  const pathname = req.nextUrl.pathname;

  const shouldCheckTenant = tenant_check_paths.some((pattern) => {
    if (pattern.endsWith("/*")) {
      return pathname.startsWith(pattern.slice(0, -2));
    }
    return pathname === pattern || pathname.startsWith(pattern + "/");
  });

  if (!shouldCheckTenant) return NextResponse.next();

  const metadata_public = session.identity?.metadata_public as any;
  const is_in_tenant = metadata_public?.is_in_tenant;

  if (!is_in_tenant) {
    return NextResponse.redirect(new URL(tenant_check_redirect_url, req.url));
  }

  return NextResponse.next();
};
