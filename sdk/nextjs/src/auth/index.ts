/**
 * Authentication module for Next.js
 *
 * This module provides comprehensive authentication functionality for Next.js applications
 * built on top of Ory Kratos. It includes session management, authentication flow routing,
 * callback handling, and server-side session retrieval optimized for the Next.js App Router.
 *
 * Key features:
 * - **Session Management**: Server-side session provider and retrieval functions
 * - **Flow Routing**: Dynamic routing for auth flows (login, registration, recovery, etc.)
 * - **Callback Handling**: OAuth and authentication callback processing
 * - **Server Components**: Built for Next.js 13+ App Router with server components
 * - **TypeScript Support**: Full type safety with comprehensive TypeScript definitions
 *
 * The authentication system supports multiple flows:
 * - Login flow for user authentication
 * - Registration flow for new user signup
 * - Recovery flow for password reset
 * - Verification flow for email/phone verification
 * - Settings flow for user profile management
 * - OAuth flows for social login providers
 *
 * @example
 * Basic authentication setup:
 * ```typescript
 * // In your root layout (app/layout.tsx)
 * import { SessionProvider } from '@omnibase/nextjs/auth';
 *
 * export default async function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <SessionProvider>
 *           {children}
 *         </SessionProvider>
 *       </body>
 *     </html>
 *   );
 * }
 *
 * // In your auth page (app/auth/[...flow]/page.tsx)
 * import { FlowRouter } from '@omnibase/nextjs/auth';
 * import { LoginForm, RegisterForm } from './components';
 *
 * export default function AuthPage({ params, searchParams }) {
 *   return (
 *     <FlowRouter
 *       params={params}
 *       searchParams={searchParams}
 *       url="/auth"
 *       flowMap={{
 *         login: (flow) => <LoginForm flow={flow} />,
 *         registration: (flow) => <RegisterForm flow={flow} />
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * Server-side session handling:
 * ```typescript
 * import { getServerSession } from '@omnibase/nextjs/auth';
 *
 * export default async function DashboardPage() {
 *   const session = await getServerSession();
 *
 *   if (!session) {
 *     redirect('/auth/login');
 *   }
 *
 *   return <div>Welcome {session.identity.traits.email}</div>;
 * }
 * ```
 *
 * @module Auth
 */

export * from "./provider";
export * from "./flow-router";
export * from "./get-flow";
