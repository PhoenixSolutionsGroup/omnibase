import type { Session } from "@omnibase/core-js/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Manages PostgREST JWT tokens for database access
 *
 * This middleware function ensures authenticated users have a valid JWT token
 * for direct PostgREST database access. It checks for an existing token cookie
 * and fetches a new one from the API if needed, storing it securely as an
 * HTTP-only cookie with a 24-hour expiration.
 *
 * The JWT token enables client-side database queries through PostgREST while
 * maintaining proper authentication and authorization. The middleware only
 * operates when a user has an active session, and it automatically handles
 * token retrieval and cookie management.
 *
 * @param req - The Next.js request object containing cookies and headers
 * @param session - The authenticated user session
 * @param api_url - The OmniBase API URL for fetching JWT tokens
 *
 * @returns NextResponse with the PostgREST JWT cookie set if applicable
 *
 * @example
 * ```typescript
 * import { postgrestJWTCheckMiddleware } from '@omnibase/nextjs/middleware';
 * import { getServerSession } from '@omnibase/nextjs/auth';
 *
 * // In your middleware.ts
 * const session = await getServerSession();
 * const response = await postgrestJWTCheckMiddleware(
 *   req,
 *   session,
 *   process.env.NEXT_PUBLIC_OMNIBASE_API_URL!
 * );
 * ```
 *
 * @since 0.5.1
 * @public
 * @group Middleware
 */
export const postgrestJWTCheckMiddleware = async (
  req: NextRequest,
  session: Session,
  api_url: string
) => {
  if (!session || !session.active) return NextResponse.next();

  const jwt = req.cookies.get("omnibase_postgrest_jwt");
  if (jwt) return NextResponse.next();

  const response = await fetch(`${api_url}/api/v1/tenants/jwt`, {
    headers: {
      Cookie: req.headers.get("cookie") || "",
    },
  });

  const json: any = await response.json();
  if (!json || !json.data || !json.data.token) return NextResponse.next();
  const nextResponse = NextResponse.next();
  nextResponse.cookies.set("omnibase_postgrest_jwt", json.data.token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours - match JWT expiry
  });
  return nextResponse;
};
