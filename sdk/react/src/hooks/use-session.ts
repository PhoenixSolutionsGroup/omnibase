import { useEffect, useState } from "react";
import type { Session } from "@omnibase/core-js/auth";
import { useAuth } from "@/context/provider";

/**
 * React hook for accessing user session information
 *
 * This hook retrieves the current authenticated user's session data from the
 * Ory Kratos authentication service. It automatically fetches the session on
 * component mount and provides loading states for displaying appropriate UI.
 *
 * The hook must be used within a component that is wrapped by the
 * [`AuthClientProvider`](../context/provider.tsx:49). It handles session retrieval, error cases
 * (setting session to null), and provides a loading state for better UX.
 *
 * @returns Object containing session data and loading state
 * @returns session - Current user session or null if not authenticated
 * @returns loading - Boolean indicating if session is being fetched
 *
 * @example
 * Basic usage with loading state:
 * ```typescript
 * import { useSession } from '@omnibase/react';
 *
 * function UserProfile() {
 *   const { session, loading } = useSession();
 *
 *   if (loading) {
 *     return <div>Loading session...</div>;
 *   }
 *
 *   if (!session) {
 *     return <div>Please log in to continue</div>;
 *   }
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
 * @example
 * Conditional rendering based on authentication:
 * ```typescript
 * import { useSession } from '@omnibase/react';
 *
 * function Dashboard() {
 *   const { session, loading } = useSession();
 *
 *   if (loading) return <LoadingSpinner />;
 *
 *   return session ? <AuthenticatedDashboard /> : <LoginPrompt />;
 * }
 * ```
 *
 * @example
 * Accessing user traits and metadata:
 * ```typescript
 * import { useSession } from '@omnibase/react';
 *
 * function UserGreeting() {
 *   const { session, loading } = useSession();
 *
 *   if (loading || !session) return null;
 *
 *   const { traits } = session.identity;
 *
 *   return (
 *     <div>
 *       <h2>Hello, {traits.name || traits.email}!</h2>
 *       <p>Member since: {new Date(session.authenticated_at).toLocaleDateString()}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Hooks
 */
export function useSession() {
  const auth = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth
      .toSession()
      .then(({ data }) => setSession(data as Session))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, [auth]);

  return { session, loading };
}
