/**
 * React hooks module
 *
 * This module provides custom React hooks for interacting with Omnibase
 * authentication and session management. These hooks simplify common
 * authentication patterns in React applications.
 *
 * @example
 * ```tsx
 * import { useSession } from '@omnibase/react';
 *
 * function Dashboard() {
 *   const { session, loading } = useSession();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!session) return <div>Please log in</div>;
 *
 *   return <div>Welcome {session.identity.traits.email}!</div>;
 * }
 * ```
 *
 * @module Hooks
 */

export * from "./use-session";
