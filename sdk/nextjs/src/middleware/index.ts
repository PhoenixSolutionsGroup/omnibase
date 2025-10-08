/**
 * Next.js middleware module for OmniBase
 *
 * This module provides Next.js middleware functionality for seamless integration
 * with the OmniBase authentication and API systems. It handles request proxying,
 * cookie management, and URL rewriting for Ory Kratos integration within Next.js
 * applications.
 *
 * Key features:
 * - **Request Proxying**: Automatic proxying of authentication requests to OmniBase API
 * - **Cookie Management**: Secure handling of authentication cookies and sessions
 * - **URL Rewriting**: Dynamic URL rewriting for development and production environments
 * - **Environment Detection**: Automatic configuration based on deployment environment
 * - **Ory Integration**: Built-in compatibility with Ory Kratos authentication flows
 *
 * The middleware automatically detects the deployment environment and configures
 * URL rewriting appropriately. In development mode or on Vercel domains, it handles
 * URL proxying to ensure authentication flows work correctly across different
 * hosting environments.
 *
 * @example
 * Basic middleware setup:
 * ```typescript
 * // In your middleware.ts file at the root of your Next.js project
 * import { createOmniBaseMiddleware } from '@omnibase/nextjs/middleware';
 *
 * export default createOmniBaseMiddleware();
 *
 * export const config = {
 *   matcher: [
 *     // Match all request paths except static files and images
 *     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
 *   ],
 * };
 * ```
 *
 * @example
 * Environment configuration:
 * ```bash
 * # Required environment variable for your OmniBase Auth Server endpoint
 * OMNIBASE_AUTH_URL=https://your-omnibase-auth.com
 *
 * # The middleware will automatically set this for Ory SDK integration
 * # NEXT_PUBLIC_ORY_SDK_URL will be set to match OMNIBASE_AUTH_URL
 * ```
 *
 * @example
 * Custom middleware with additional logic:
 * ```typescript
 * import { createOmniBaseMiddleware } from '@omnibase/nextjs/middleware';
 * import { NextRequest, NextResponse } from 'next/server';
 *
 * const omnibaseMiddleware = createOmniBaseMiddleware();
 *
 * export default function middleware(request: NextRequest) {
 *   // Run OmniBase middleware first
 *   const response = omnibaseMiddleware(request);
 *
 *   // Add custom logic here if needed
 *   if (request.nextUrl.pathname.startsWith('/admin')) {
 *     // Additional admin route logic
 *   }
 *
 *   return response;
 * }
 * ```
 *
 * @module Middleware
 */

export * from "./middleware";
