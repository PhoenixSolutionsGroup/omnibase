/**
 * Authentication context module
 *
 * This module provides React context and providers for managing authentication
 * state across your React application. It includes the [`AuthClientProvider`](provider.tsx:80) for
 * wrapping your app and the [`useAuth()`](provider.tsx:144) hook for accessing the authentication client.
 *
 * @example
 * ```tsx
 * import { AuthClientProvider } from '@omnibase/react';
 *
 * function App() {
 *   return (
 *     <AuthClientProvider basePath="http://localhost:4000">
 *       <YourApp />
 *     </AuthClientProvider>
 *   );
 * }
 * ```
 *
 * @module Context
 */

export * from "./provider";
