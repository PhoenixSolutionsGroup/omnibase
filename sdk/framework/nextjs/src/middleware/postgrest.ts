import type { Session } from "@ory/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * Decodes a JWT token without verification to extract the payload.
 * Used only to check expiration time - actual verification happens on the server.
 */
function decodeJWTPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT token is expired or will expire within the buffer period.
 * @param token - The JWT token string
 * @param bufferSeconds - Refresh if token expires within this many seconds (default: 5 minutes)
 */
function isJWTExpiredOrExpiring(token: string, bufferSeconds = 300): boolean {
  const payload = decodeJWTPayload(token);
  if (!payload?.exp) return true; // If we can't read exp, treat as expired
  const expiresAt = payload.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  const bufferMs = bufferSeconds * 1000;
  return now >= expiresAt - bufferMs;
}

/**
 * Manages PostgREST JWT tokens for database access
 *
 * This middleware function ensures authenticated users have a valid JWT token
 * for direct PostgREST database access. It checks for an existing token cookie,
 * validates that the JWT is not expired (or about to expire), and fetches a new
 * one from the API if needed, storing it securely as an HTTP-only cookie.
 *
 * The JWT token enables client-side database queries through PostgREST while
 * maintaining proper authentication and authorization. The middleware only
 * operates when a user has an active session, and it automatically handles
 * token retrieval, refresh, and cookie management.
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

  // Check if JWT exists and is still valid (not expired or expiring soon)
  if (jwt?.value && !isJWTExpiredOrExpiring(jwt.value)) {
    return NextResponse.next();
  }

  // Fetch a new JWT - either missing or expired/expiring
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
