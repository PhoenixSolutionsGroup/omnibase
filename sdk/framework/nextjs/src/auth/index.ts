/**
 * Authentication module for Next.js
 *
 * This module provides comprehensive authentication functionality for Next.js applications
 * built on top of Ory Kratos. It includes session management, authentication flow routing,
 * and server-side session retrieval optimized for the Next.js 13+ App Router.
 *
 * ## Key Features
 *
 * - **Session Management**: Server-side session provider and retrieval with [`SessionProvider`](./provider.tsx:55) and [`getServerSession`](./provider.tsx:26)
 * - **Flow Routing**: Dynamic routing for authentication flows via [`FlowRouter`](./flow-router.ts:135)
 * - **Route Protection**: Server-side route guards with [`protectedRoute`](./protected-route.ts:44)
 * - **Server Components**: Built for Next.js 13+ App Router with server components
 * - **TypeScript Support**: Full type safety with comprehensive TypeScript definitions
 *
 * ## Supported Authentication Flows
 *
 * - **Login**: User authentication with email/password or OAuth
 * - **Registration**: New user signup with customizable identity traits
 * - **Recovery**: Password reset and account recovery
 * - **Verification**: Email and account verification
 * - **Settings**: User profile and account management
 * - **Logout**: Secure session termination
 *
 * @example
 * Complete authentication setup in a Next.js app:
 * ```tsx
 * // app/auth/[...flow]/page.tsx - Authentication flow router
 * import { FlowRouter } from '@omnibase/nextjs/auth';
 * import { LoginForm, RegistrationForm, RecoveryForm } from '@omnibase/shadcn';
 *
 * export default function AuthPage({
 *   params,
 *   searchParams
 * }: {
 *   params: Promise<{ flow: string[] }>;
 *   searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
 * }) {
 *   return (
 *     <FlowRouter
 *       params={params}
 *       searchParams={searchParams}
 *       url="/auth"
 *       returnTo="/"
 *       flowMap={{
 *         login: (flow) => <LoginForm flow={flow} register_url="/auth/registration" />,
 *         registration: (flow) => <RegistrationForm flow={flow} login_url="/auth/login" />,
 *         recovery: (flow) => <RecoveryForm flow={flow} />,
 *       }}
 *       onNotFound={<div>Authentication flow not found</div>}
 *     />
 *   );
 * }
 *
 * // app/(dashboard)/page.tsx - Protected route example
 * import { protectedRoute } from '@omnibase/nextjs/auth';
 *
 * export default async function DashboardPage() {
 *   const session = await protectedRoute('/auth/login');
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {session.identity.traits.email}!</h1>
 *       <p>User ID: {session.identity.id}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @module Auth
 * @since 0.5.1
 */

export * from "./provider";
export * from "./flow-router";
export * from "./get-flow";
export * from "./protected-route";
