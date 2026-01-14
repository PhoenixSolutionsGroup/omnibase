import {
  getRecoveryFlow as recoveryFlow,
  getLoginFlow as loginFlow,
  getRegistrationFlow as registrationFlow,
  getSettingsFlow as settingsFlow,
  getVerificationFlow as verificationFlow,
  getLogoutFlow as logoutFlow,
} from "@ory/nextjs/app";

import type {
  LoginFlow,
  LogoutFlow,
  RecoveryFlow,
  RegistrationFlow,
  SettingsFlow,
  VerificationFlow,
} from "@ory/client";
import { FrontendApi, Configuration, type FlowError } from "@ory/client-fetch";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Properties required for retrieving authentication flows
 *
 * Configuration object used to fetch authentication flow data from Ory Kratos.
 * This type is used by all flow retrieval functions to specify the UI URL
 * and pass along search parameters that contain flow state.
 *
 * @example
 * ```typescript
 * const props: GetFlowProps = {
 *   url: '/auth/login',
 *   searchParams: Promise.resolve({ flow: 'abc123' })
 * };
 * ```
 *
 * @since 0.5.1
 * @public
 * @group Flow Retrieval
 */
export type GetFlowProps = {
  /** The UI URL for the specific authentication flow (e.g., '/auth/login') */
  url: string;
  /** Promise resolving to search parameters from the request, containing flow ID and state */
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

/**
 * Retrieves a login flow for user authentication
 *
 * Fetches login flow data from Ory Kratos, which includes form fields, CSRF tokens,
 * and UI configuration needed to render a login form. This function is used server-side
 * in Next.js App Router components.
 *
 * @param props - Configuration object containing URL and search parameters
 * @param props.url - The login UI URL (e.g., '/auth/login')
 * @param props.searchParams - Promise resolving to search parameters containing flow state
 *
 * @returns Promise that resolves to a LoginFlow object or null if the flow cannot be retrieved
 *
 * @example
 * ```typescript
 * // In a Next.js server component
 * import { getLoginFlow } from '@omnibase/nextjs/auth';
 *
 * const flow = await getLoginFlow({
 *   url: '/auth/login',
 *   searchParams: Promise.resolve({ flow: 'abc123' })
 * });
 *
 * if (flow) {
 *   return <LoginForm flow={flow} />;
 * }
 * ```
 *
 * @since 0.5.1
 * @public
 * @group Flow Retrieval
 */
export const getLoginFlow = async (
  props: GetFlowProps
): Promise<LoginFlow | null> => {
  const flow = await loginFlow(
    { project: { login_ui_url: props.url } },
    props.searchParams
  );
  if (!flow) return null;
  else return flow;
};

/**
 * Retrieves a recovery flow for password reset and account recovery
 *
 * Fetches recovery flow data from Ory Kratos, which provides the form structure
 * and configuration needed to render a password recovery interface. Users can
 * request password reset links via email.
 *
 * @param props - Configuration object containing URL and search parameters
 * @param props.url - The recovery UI URL (e.g., '/auth/recovery')
 * @param props.searchParams - Promise resolving to search parameters containing flow state
 *
 * @returns Promise that resolves to a RecoveryFlow object or null if the flow cannot be retrieved
 *
 * @example
 * ```typescript
 * // In a Next.js server component
 * import { getRecoveryFlow } from '@omnibase/nextjs/auth';
 *
 * const flow = await getRecoveryFlow({
 *   url: '/auth/recovery',
 *   searchParams: Promise.resolve({ flow: 'def456' })
 * });
 *
 * if (flow) {
 *   return <RecoveryForm flow={flow} />;
 * }
 * ```
 *
 * @since 0.5.1
 * @public
 * @group Flow Retrieval
 */
export const getRecoveryFlow = async (
  props: GetFlowProps
): Promise<RecoveryFlow | null> => {
  const flow = await recoveryFlow(
    {
      project: { recovery_ui_url: props.url },
    },
    props.searchParams
  );
  if (!flow) return null;
  else return flow;
};

/**
 * Retrieves a registration flow for new user account creation
 *
 * Fetches registration flow data from Ory Kratos, which includes the form structure
 * for user signup. This typically includes fields for email, password, and any
 * custom traits defined in your Ory Kratos identity schema.
 *
 * @param props - Configuration object containing URL and search parameters
 * @param props.url - The registration UI URL (e.g., '/auth/registration')
 * @param props.searchParams - Promise resolving to search parameters containing flow state
 *
 * @returns Promise that resolves to a RegistrationFlow object or null if the flow cannot be retrieved
 *
 * @example
 * ```typescript
 * // In a Next.js server component
 * import { getRegistrationFlow } from '@omnibase/nextjs/auth';
 *
 * const flow = await getRegistrationFlow({
 *   url: '/auth/registration',
 *   searchParams: Promise.resolve({ flow: 'ghi789' })
 * });
 *
 * if (flow) {
 *   return <RegistrationForm flow={flow} />;
 * }
 * ```
 *
 * @since 0.5.1
 * @public
 * @group Flow Retrieval
 */
export const getRegistrationFlow = async (
  props: GetFlowProps
): Promise<RegistrationFlow | null> => {
  const flow = await registrationFlow(
    {
      project: { registration_ui_url: props.url },
    },
    props.searchParams
  );
  if (!flow) return null;
  else return flow;
};

/**
 * Retrieves a settings flow for user account management and profile updates
 *
 * Fetches settings flow data from Ory Kratos, which provides forms for updating
 * user profile information, changing passwords, managing authentication methods,
 * and other account settings. This requires an active user session.
 *
 * @param props - Configuration object containing URL and search parameters
 * @param props.url - The settings UI URL (e.g., '/auth/settings')
 * @param props.searchParams - Promise resolving to search parameters containing flow state
 *
 * @returns Promise that resolves to a SettingsFlow object or null if the flow cannot be retrieved
 *
 * @example
 * ```typescript
 * // In a Next.js server component (requires authenticated session)
 * import { getSettingsFlow } from '@omnibase/nextjs/auth';
 *
 * const flow = await getSettingsFlow({
 *   url: '/auth/settings',
 *   searchParams: Promise.resolve({ flow: 'jkl012' })
 * });
 *
 * if (flow) {
 *   return <SettingsForm flow={flow} />;
 * }
 * ```
 *
 * @since 0.5.1
 * @public
 * @group Flow Retrieval
 */
export const getSettingsFlow = async (
  props: GetFlowProps
): Promise<SettingsFlow | null> => {
  const flow = await settingsFlow(
    {
      project: { settings_ui_url: props.url },
    },
    props.searchParams
  );
  if (!flow) return null;
  else return flow;
};

/**
 * Retrieves a verification flow for email or account verification
 *
 * Fetches verification flow data from Ory Kratos, which handles email and account
 * verification processes. Users receive verification links via email that include
 * the flow ID in the URL parameters.
 *
 * @param props - Configuration object containing URL and search parameters
 * @param props.url - The verification UI URL (e.g., '/auth/verification')
 * @param props.searchParams - Promise resolving to search parameters containing flow state
 *
 * @returns Promise that resolves to a VerificationFlow object or null if the flow cannot be retrieved
 *
 * @example
 * ```typescript
 * // In a Next.js server component
 * import { getVerificationFlow } from '@omnibase/nextjs/auth';
 *
 * const flow = await getVerificationFlow({
 *   url: '/auth/verification',
 *   searchParams: Promise.resolve({ flow: 'mno345', code: 'verify-token' })
 * });
 *
 * if (flow) {
 *   return <VerificationForm flow={flow} />;
 * }
 * ```
 *
 * @since 0.5.1
 * @public
 * @group Flow Retrieval
 */
export const getVerificationFlow = async (
  props: GetFlowProps
): Promise<VerificationFlow | null> => {
  const flow = await verificationFlow(
    {
      project: { verification_ui_url: props.url },
    },
    props.searchParams
  );
  if (!flow) return null;
  else return flow;
};

/**
 * Return type for the getLogoutFlow function
 *
 * Contains both the logout flow data and a server action for executing
 * the logout process, including clearing all authentication cookies.
 *
 * @since 0.5.1
 * @public
 * @group Flow Retrieval
 */
export type LogoutFlowReturnType = {
  /** Logout flow object from Ory Kratos containing logout URL and token */
  flow: LogoutFlow;
  /** Server action that clears authentication cookies and completes logout */
  action: () => Promise<void>;
};

/**
 * Retrieves a logout flow for the authenticated user with complete logout handling
 *
 * Fetches logout flow data from Ory Kratos and provides a server action that handles
 * the complete logout process. This includes clearing session cookies (ory_kratos_session,
 * ory_kratos_continuity, omnibase_postgrest_jwt) and calling the Ory logout endpoint.
 *
 * The returned action should be called from a form or button to execute the logout
 * and redirect the user to the specified return URL.
 *
 * @param props - Configuration object containing the return URL after logout
 * @param props.returnTo - URL to redirect to after successful logout
 *
 * @returns Promise that resolves to a LogoutFlowReturnType object containing the flow and action, or null if the flow cannot be retrieved
 *
 * @throws Will redirect to the returnTo URL after successful logout
 *
 * @example
 * ```typescript
 * // In a Next.js server component
 * import { getLogoutFlow } from '@omnibase/nextjs/auth';
 *
 * export default async function LogoutButton() {
 *   const logoutFlow = await getLogoutFlow({ returnTo: '/' });
 *
 *   if (!logoutFlow) {
 *     return <div>Unable to logout</div>;
 *   }
 *
 *   return (
 *     <form action={logoutFlow.action}>
 *       <button type="submit">Sign Out</button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @since 0.5.1
 * @public
 * @group Flow Retrieval
 */
export const getLogoutFlow = async ({
  returnTo,
}: {
  returnTo: string;
}): Promise<LogoutFlowReturnType | null> => {
  const flow: LogoutFlow = await logoutFlow({ returnTo });
  if (!flow) return null;
  else
    return {
      flow,
      action: async () => {
        "use server";
        const cookieStore = await cookies();
        cookieStore.delete("omnibase_postgrest_jwt");
        cookieStore.delete("ory_kratos_continuity");
        cookieStore.delete("ory_kratos_session");

        await fetch(flow.logout_url, {
          credentials: "include",
          headers: {
            Cookie: cookieStore.toString(),
          },
        });
        redirect(returnTo);
      },
    };
};

/**
 * Properties required for retrieving error flow details
 *
 * @since 0.7.0
 * @public
 * @group Flow Retrieval
 */
export type GetErrorFlowProps = {
  /** Promise resolving to search parameters containing the error ID */
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

/**
 * Retrieves error details for a user-facing authentication error
 *
 * When Ory Kratos encounters an error during authentication flows (CSRF failures,
 * expired flows, OAuth errors, etc.), it redirects to the error UI with an error ID.
 * This function fetches the error details using that ID.
 *
 * @param props - Configuration object containing search parameters
 * @param props.searchParams - Promise resolving to search parameters containing the error ID
 *
 * @returns Promise that resolves to a FlowError object or null if the error cannot be retrieved
 *
 * @example
 * ```typescript
 * // In a Next.js server component
 * import { getErrorFlow } from '@omnibase/nextjs/auth';
 *
 * const error = await getErrorFlow({
 *   searchParams: Promise.resolve({ id: 'error-id-123' })
 * });
 *
 * if (error) {
 *   return <ErrorForm error={error} />;
 * }
 * ```
 *
 * @since 0.7.0
 * @public
 * @group Flow Retrieval
 */
export const getErrorFlow = async (
  props: GetErrorFlowProps
): Promise<FlowError | null> => {
  const params = await props.searchParams;
  const id = typeof params.id === "string" ? params.id : params.id?.[0];

  if (!id) return null;

  const ory = new FrontendApi(
    new Configuration({
      basePath: process.env.NEXT_PUBLIC_ORY_SDK_URL,
    })
  );

  try {
    return await ory.getFlowError({ id });
  } catch {
    return null;
  }
};

export type { FlowError };
