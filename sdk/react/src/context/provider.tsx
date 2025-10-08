import { FrontendApi, Configuration } from "@ory/client";
import { createContext, useContext, type ReactNode } from "react";

// Create context for Ory configuration
const OryContext = createContext<FrontendApi | null>(null);

/**
 * Configuration properties for the authentication provider
 *
 * @example
 * ```typescript
 * const props: AuthProviderProps = {
 *   basePath: 'https://api.example.com',
 *   children: <App />
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Context
 */
export type AuthProviderProps = {
  /** Base URL for the Omnibase API endpoint */
  basePath: string;

  /** React children components to be wrapped by the provider */
  children: ReactNode;
};

/**
 * Authentication provider component for React applications
 *
 * This provider wraps your React application and provides authentication context
 * to all child components. It initializes the Ory Kratos client with the specified
 * base path and enables credential-based authentication.
 *
 * This provider is required when using the [`useSession()`](../hooks/use-session.ts:8) hook to access session
 * information from client components. It configures the Ory Kratos FrontendApi
 * client with automatic credential handling.
 *
 * @param props - Configuration object for the provider
 * @param props.basePath - Base URL of your Omnibase API (e.g., 'https://api.example.com')
 * @param props.children - React components to be wrapped by this provider
 *
 * @returns Provider component wrapping the children with authentication context
 *
 * @example
 * Basic setup in a React app:
 * ```typescript
 * import { AuthClientProvider } from '@omnibase/react';
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
 * @example
 * Using with environment variables:
 * ```typescript
 * import { AuthClientProvider } from '@omnibase/react';
 *
 * function App() {
 *   return (
 *     <AuthClientProvider basePath={process.env.REACT_APP_API_URL}>
 *       <Dashboard />
 *       <UserProfile />
 *     </AuthClientProvider>
 *   );
 * }
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Context
 */
export function AuthClientProvider({ basePath, children }: AuthProviderProps) {
  const ory = new FrontendApi(
    new Configuration({
      basePath,
      baseOptions: {
        withCredentials: true,
      },
    })
  );

  return <OryContext.Provider value={ory}>{children}</OryContext.Provider>;
}

/**
 * Hook to access the Ory authentication client
 *
 * This hook provides access to the Ory Kratos FrontendApi client instance
 * configured by the [`AuthClientProvider`](provider.tsx:49). It must be used within components
 * that are descendants of the provider.
 *
 * The returned client can be used to make direct calls to the Ory Kratos API
 * for advanced authentication operations beyond what the standard hooks provide.
 *
 * @returns Configured Ory FrontendApi client instance
 *
 * @throws {Error} When called outside of [`AuthClientProvider`](provider.tsx:49) context
 *
 * @example
 * Accessing the auth client:
 * ```typescript
 * import { useAuth } from '@omnibase/react';
 *
 * function CustomAuthComponent() {
 *   const ory = useAuth();
 *
 *   const handleLogout = async () => {
 *     const { data } = await ory.createBrowserLogoutFlow();
 *     window.location.href = data.logout_url;
 *   };
 *
 *   return <button onClick={handleLogout}>Logout</button>;
 * }
 * ```
 *
 * @example
 * Handling the error case:
 * ```typescript
 * import { useAuth } from '@omnibase/react';
 *
 * function ProtectedComponent() {
 *   try {
 *     const ory = useAuth();
 *     // Use ory client...
 *   } catch (error) {
 *     console.error('Component must be within AuthClientProvider');
 *     return <div>Configuration error</div>;
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Context
 */
export function useAuth() {
  const context = useContext(OryContext);
  if (!context) {
    throw new Error("useOry must be used within OryProvider");
  }
  return context;
}
