/**
 * React SDK for Omnibase
 *
 * This module provides React components, hooks, and context providers for integrating
 * Omnibase authentication and session management into React applications.
 *
 * Key features:
 * - Session management with `useSession` hook
 * - Authentication context provider via `AuthClientProvider`
 * - Automatic session retrieval and state management
 * - Built on Ory Kratos for robust authentication
 *
 * @example
 * Basic usage:
 * ```typescript
 * import { AuthClientProvider, useSession } from '@omnibase/react';
 *
 * function App() {
 *   return (
 *     <AuthClientProvider basePath="https://api.example.com">
 *       <YourApp />
 *     </AuthClientProvider>
 *   );
 * }
 *
 * function YourApp() {
 *   const { session, loading } = useSession();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!session) return <div>Not authenticated</div>;
 *
 *   return <div>Welcome {session.identity.traits.email}!</div>;
 * }
 * ```
 *
 * @module React
 */

export * from "./context";
export * from "./hooks";
