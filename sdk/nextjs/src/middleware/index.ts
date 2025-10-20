/**
 * Next.js middleware module for OmniBase
 *
 * This module provides Next.js middleware functionality for seamless integration
 * with the OmniBase authentication and tenant management systems. It combines
 * Ory Kratos authentication, tenant membership validation, and PostgREST JWT
 * management into a single, easy-to-configure middleware solution.
 *
 * Key features:
 * - **Authentication**: Ory Kratos integration with automatic session management
 * - **Tenant Validation**: Configurable tenant membership checking for protected routes
 * - **PostgREST JWT**: Automatic JWT token management for direct database access
 * - **Cookie Management**: Secure handling of authentication and database access tokens
 * - **Path Matching**: Flexible path patterns with exact, prefix, and wildcard support
 * - **Redirects**: Automatic redirection for users without tenant access
 *
 * The middleware operates in a pipeline, first validating tenant membership (if
 * enabled), then ensuring PostgREST JWT tokens are available, and finally delegating
 * to Ory middleware for authentication. All cookies are properly merged and forwarded
 * in the response.
 *
 * @example
 * ```typescript
 * // middleware.ts - Basic setup at the root of your Next.js project
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
 * @module Middleware
 * @since 0.5.1
 */

export * from "./middleware";
