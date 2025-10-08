/**
 * OmniBase Next.js SDK
 *
 * A comprehensive Next.js SDK for the OmniBase Backend-as-a-Service platform.
 * This SDK provides seamless integration with authentication, tenant management,
 * middleware, and database functionality specifically designed for Next.js applications.
 *
 * Key features:
 * - **Authentication**: Complete auth flow management with Ory Kratos integration
 * - **Tenant Management**: Multi-tenant application support with server actions
 * - **Middleware**: Request proxying and cookie management for Next.js
 * - **Server Actions**: Ready-to-use form actions for tenant operations
 * - **Session Management**: Server and client-side session handling
 *
 * The SDK is built on top of the core-js SDK and provides Next.js-specific
 * optimizations including server components, server actions, and middleware
 * integration for a seamless developer experience.
 *
 * @example
 * Basic setup in your Next.js application:
 * ```typescript
 * // In your root layout (app/layout.tsx)
 * import { SessionProvider } from '@omnibase/nextjs';
 *
 * export default async function RootLayout({
 *   children,
 * }: {
 *   children: React.ReactNode;
 * }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <SessionProvider>
 *           {children}
 *         </SessionProvider>
 *       </body>
 *     </html>
 *   );
 * }
 *
 * // In your middleware (middleware.ts)
 * import { createOmniBaseMiddleware } from '@omnibase/nextjs';
 *
 * export default createOmniBaseMiddleware();
 *
 * export const config = {
 *   matcher: [
 *     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
 *   ],
 * };
 * ```
 *
 * @module NextJS
 */

// Re-export all functionality from sub-modules
export * from "./auth";
export * from "./tenants";
export * from "./middleware";
export * from "./permissions";
