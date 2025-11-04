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
 * [`AuthClientProvider`](../context/provider.tsx:80). It handles session retrieval, error cases
 * (setting session to null when unauthenticated), and provides a loading state for better UX.
 *
 * @returns Object containing session data and loading state
 * @returns session - Current user session or null if not authenticated
 * @returns loading - Boolean indicating if session is being fetched
 *
 * @example
 * ```tsx
 * import { useSession } from '@omnibase/react';
 *
 * function UserProfile() {
 *   const { session, loading } = useSession();
 *
 *   if (loading) {
 *     return <div>Loading...</div>;
 *   }
 *
 *   if (!session || !session.active) {
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
 * @since 0.2.0
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
