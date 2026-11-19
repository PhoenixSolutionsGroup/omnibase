/**
 * Next.js middleware module for OmniBase
 *
 * This module provides Next.js middleware functionality for seamless integration
 * with the OmniBase authentication and tenant management systems. It combines
 * Ory Kratos authentication and tenant membership validation into a single,
 * easy-to-configure middleware solution.
 *
 * Key features:
 * - **Authentication**: Ory Kratos integration with automatic session management
 * - **Tenant Validation**: Configurable tenant membership checking for protected routes
 * - **Cookie Management**: Secure handling of authentication cookies
 * - **Path Matching**: Flexible path patterns with exact, prefix, and wildcard support
 * - **Redirects**: Automatic redirection for users without tenant access
 *
 * The middleware operates in a pipeline, first validating tenant membership (if
 * enabled), then delegating to Ory middleware for authentication.
 *
 * @example
 * ```typescript
 * // middleware.ts - Basic setup at the root of your Next.js project
 * import { createOmniBaseMiddleware } from '@omnibase/nextjs/middleware';
 *
 * export const middleware = createOmniBaseMiddleware();
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
