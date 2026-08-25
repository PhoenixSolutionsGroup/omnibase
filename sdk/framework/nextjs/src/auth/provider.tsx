import type { ReactNode } from "react";

import {
  SessionProvider as OrySessionProvider,
  type SessionProviderProps,
} from "@ory/elements-react/client";
import { getServerSession as getServerSessionOry } from "@ory/nextjs/app";
import type { Session } from "@ory/client";
import { SessionToJSON } from "@omnibase/core-js";
import { getTokenSession } from "./session";

/**
 * Fetches the current session on the server side
 *
 * This helper function retrieves the authenticated user's session from Ory Kratos
 * in Next.js Server Components and Server Actions. It works with server-side rendering
 * and leverages Next.js's cookie handling to access session data securely.
 *
 * The session is resolved in two ways:
 * - When an `omnibase_session_token` cookie is present, the session is validated
 *   against the OmniBase API using the `X-Session-Token` header. This is the
 *   origin-independent path (works from any domain).
 * - Otherwise it falls back to the Ory cookie session (`ory_kratos_session`),
 *   which only works when the app shares a registrable domain with the API.
 *
 * The session object contains the user's identity, authentication status, and session
 * metadata. Use this function to check authentication status, access user data, or
 * implement authorization logic in server components.
 *
 * @returns Promise resolving to the Session object, or null if no active session exists
 *
 * @example
 * ```tsx
 * // Check authentication and access user data
 * import { getServerSession } from '@omnibase/nextjs/auth';
 * import { redirect } from 'next/navigation';
 *
 * export default async function ProfilePage() {
 *   const session = await getServerSession();
 *
 *   if (!session || !session.active) {
 *     redirect('/auth/login');
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Profile</h1>
 *       <p>Email: {session.identity.traits.email}</p>
 *       <p>User ID: {session.identity.id}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @since 0.5.1
 * @public
 * @group Session Management
 */
export const getServerSession = async (): Promise<Session | null> => {
  const tokenSession = await getTokenSession();
  if (tokenSession) {
    return SessionToJSON(tokenSession) as Session;
  }
  return getServerSessionOry();
};

/**
 * Server-side React component that provides session context to the component tree
 *
 * This async server component fetches the current session from Ory Kratos and wraps
 * children with a session provider, making session data available throughout the
 * component tree via React Context. It's designed to be used in the root layout
 * of Next.js 13+ applications.
 *
 * The SessionProvider enables client components to access session data via the
 * Ory Elements session hook, while still maintaining server-side session fetching
 * for optimal performance and security.
 *
 * **Note**: This component should be placed in your root layout to provide session
 * context to all pages in your application.
 *
 * @param props - Component props
 * @param props.children - React nodes to be wrapped with session context
 *
 * @returns Promise resolving to a session provider component with session data
 *
 * @example
 * ```tsx
 * // app/layout.tsx - Root layout with session provider
 * import { SessionProvider } from '@omnibase/nextjs/auth';
 *
 * export default async function RootLayout({
 *   children
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
 * ```
 *
 * @since 0.5.1
 * @public
 * @group Session Management
 */
export async function SessionProvider({ children }: { children?: ReactNode }) {
  const session = await getServerSession();

  return (
    <OrySessionProvider session={session as SessionProviderProps["session"]}>
      {children}
    </OrySessionProvider>
  );
}
