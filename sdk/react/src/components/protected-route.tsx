import { useSession } from "@/hooks";
import React, { type ReactNode } from "react";

/**
 * Client-side route protection component for React applications
 *
 * This component protects routes by checking if the user has an active session.
 * It uses the [`useSession`](../hooks/use-session.ts:84) hook to fetch session data and automatically
 * handles loading states, invalid sessions, and authenticated access. When a session
 * is invalid or missing, it can either render nothing or execute a custom callback
 * (e.g., redirecting to a login page).
 *
 * The component must be used within the authentication provider context to access
 * session data. During the loading phase, it renders nothing to prevent flash of
 * unauthorized content.
 *
 * @param props - Component props
 * @param props.children - React nodes to render when session is valid and active
 * @param props.onInvalidSession - Optional callback executed when session is invalid or inactive
 *
 * @returns Protected content if authenticated, result of callback or null if not authenticated, null while loading
 *
 * @example
 * ```tsx
 * import ProtectedRoute from '@omnibase/react/components/protected-route';
 * import { useRouter } from 'react-router-dom';
 *
 * function DashboardPage() {
 *   const router = useRouter();
 *
 *   return (
 *     <ProtectedRoute
 *       onInvalidSession={() => {
 *         router.push('/login');
 *         return <div>Redirecting to login...</div>;
 *       }}
 *     >
 *       <div>
 *         <h1>Protected Dashboard</h1>
 *         <p>This content is only visible to authenticated users.</p>
 *       </div>
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Components
 */
export default function ProtectedRoute({
  children,
  onInvalidSession,
}: {
  children: ReactNode | ReactNode[];
  onInvalidSession?: () => any;
}) {
  const { session, loading } = useSession();

  if (loading) return null;
  if (!session || !session.active) return onInvalidSession?.() ?? null;

  return <>{children}</>;
}
