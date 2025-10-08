/**
 * Authentication context module
 *
 * This module provides React context and providers for managing authentication
 * state across your React application. It includes the `AuthClientProvider` for
 * wrapping your app and the `useAuth` hook for accessing the authentication client.
 *
 * @example
 * ```typescript
 * import { AuthClientProvider } from '@omnibase/react/context';
 *
 * function App() {
 *   return (
 *     <AuthClientProvider basePath="https://api.example.com">
 *       <YourApp />
 *     </AuthClientProvider>
 *   );
 * }
 * ```
 *
 * @module Context
 */

export * from "./provider";
