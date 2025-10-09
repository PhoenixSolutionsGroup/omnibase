import { redirect } from "next/navigation";
import { getServerSession } from "./provider";

/**
 * Server-side route protection utility for Next.js App Router
 *
 * This function protects server-side routes by checking if the user has an
 * active session. It uses Next.js App Router's [`getServerSession`](./provider.tsx:26) to fetch
 * session data on the server and automatically redirects to a specified path
 * if the session is invalid or inactive.
 *
 * This utility is designed for Next.js 13+ App Router with Server Components
 * and Server Actions. It leverages server-side session validation without
 * exposing authentication logic to the client, making it ideal for protecting
 * API routes, Server Components, and Server Actions.
 *
 * @param redirectTo - Path to redirect to when session is invalid (default: "/auth/login")
 *
 * @returns Promise resolving to the active session object
 *
 * @throws Never throws - redirects instead using Next.js [`redirect()`](https://nextjs.org/docs/app/api-reference/functions/redirect)
 *
 * @example
 * ```typescript
 * import { protectedRoute } from '@omnibase/nextjs/auth';
 *
 * // Protect a Server Component page
 * export default async function DashboardPage() {
 *   const session = await protectedRoute();
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {session.identity.traits.email}!</h1>
 *       <p>This page is only accessible to authenticated users.</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Authentication
 */
export async function protectedRoute(redirectTo: string = "/auth/login") {
  const session = await getServerSession();
  if (!session || !session.active) redirect(redirectTo);
  return session;
}
