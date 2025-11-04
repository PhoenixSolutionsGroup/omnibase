import { FrontendApi, Configuration } from "@ory/client";
import { createContext, useContext, type ReactNode } from "react";

// Create context for Ory configuration
const OryContext = createContext<FrontendApi | null>(null);

/**
 * Configuration properties for the authentication provider
 *
 * @example
 * ```tsx
 * const props: AuthProviderProps = {
 *   basePath: 'http://localhost:4000',
 *   children: <App />
 * };
 * ```
 *
 * @since 0.2.0
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
 * This provider is required when using the [`useSession()`](../hooks/use-session.ts:84) hook or
 * [`ProtectedRoute`](../components/protected-route.tsx:51) component. It configures the Ory Kratos FrontendApi
 * client with automatic credential handling for cookie-based sessions.
 *
 * @param props - Configuration object for the provider
 * @param props.basePath - Base URL of your Omnibase API (e.g., 'http://localhost:4000')
 * @param props.children - React components to be wrapped by this provider
 *
 * @returns Provider component wrapping the children with authentication context
 *
 * @example
 * ```tsx
 * import { AuthClientProvider } from '@omnibase/react';
 *
 * export default function ClientProvider({ children }: { children: React.ReactNode }) {
 *   return (
 *     <AuthClientProvider basePath={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}>
 *       {children}
 *     </AuthClientProvider>
 *   );
 * }
 * ```
 *
 * @since 0.2.0
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
 * configured by the [`AuthClientProvider`](provider.tsx:80). It must be used within components
 * that are descendants of the provider.
 *
 * The returned client can be used to make direct calls to the Ory Kratos API
 * for advanced authentication operations. Most common use cases are covered by
 * the [`useSession()`](../hooks/use-session.ts:84) hook, but this hook is useful for custom
 * authentication flows or accessing lower-level Ory APIs.
 *
 * @returns Configured Ory FrontendApi client instance
 *
 * @throws {Error} When called outside of [`AuthClientProvider`](provider.tsx:80) context
 *
 * @example
 * ```tsx
 * import { useAuth } from '@omnibase/react';
 *
 * function LogoutButton() {
 *   const ory = useAuth();
 *
 *   const handleLogout = async () => {
 *     const { data } = await ory.createBrowserLogoutFlow();
 *     window.location.href = data.logout_url;
 *   };
 *
 *   return <button onClick={handleLogout}>Sign Out</button>;
 * }
 * ```
 *
 * @since 0.2.0
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
