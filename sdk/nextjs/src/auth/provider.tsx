import type { ReactNode } from "react";

import {
  SessionProvider as OrySessionProvider,
  type SessionProviderProps,
} from "@ory/elements-react/client";
import { getServerSession as getServerSessionOry } from "@ory/nextjs/app";
import type { Session } from "@omnibase/core-js/auth";

/**
 * A helper to fetch the session on the server side. This method works with server-side rendering.
 *
 * @example
 * ````tsx
 *  import { getServerSession } from "@omnibase/nextjs/auth"
 *
 *  async function MyComponent() {
 *      const session = await getServerSession()
 *
 *      if (!session) {
 *          return <p>No session found</p>
 *      }
 *  }
 * ````
 */
export const getServerSession =
  getServerSessionOry as unknown as () => Promise<Session>;

/**
 * A server-side React component that provides session context to its children.
 * This component fetches the current session from the server and wraps children
 * with a session provider to make session data available throughout
 * the component tree.
 *
 * @param props - The component props
 * @param props.children - Optional React nodes to be wrapped with session context
 * @returns A Promise that resolves to a session provider component with session data
 *
 * @example
 * ```tsx
 * // Use in the root layout component
 * export default async function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <SessionProvider>
 *           {children}
 *         </SessionProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export async function SessionProvider({ children }: { children?: ReactNode }) {
  const session = await getServerSession();

  return (
    <OrySessionProvider session={session as SessionProviderProps["session"]}>
      {children}
    </OrySessionProvider>
  );
}
