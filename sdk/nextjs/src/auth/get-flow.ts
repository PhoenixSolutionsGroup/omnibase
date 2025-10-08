import {
  getRecoveryFlow as recoveryFlow,
  getLoginFlow as loginFlow,
  getRegistrationFlow as registrationFlow,
  getSettingsFlow as settingsFlow,
  getVerificationFlow as verificationFlow,
  getLogoutFlow as logoutFlow,
} from "@ory/nextjs/app";

// Environment variable polyfill for Ory SDK
if (typeof globalThis !== "undefined" && !process.env.NEXT_PUBLIC_ORY_SDK_URL) {
  process.env.NEXT_PUBLIC_ORY_SDK_URL = process.env.OMNIBASE_AUTH_URL;
}

import type {
  LoginFlow,
  LogoutFlow,
  RecoveryFlow,
  RegistrationFlow,
  SettingsFlow,
  VerificationFlow,
} from "@omnibase/core-js/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Properties required for retrieving authentication flows.
 *
 * @public
 */
export type GetFlowProps = {
  /** The UI URL for the specific flow */
  url: string;
  /** Search parameters from the request, containing flow state and configuration */
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

/**
 * Retrieves a login flow for user authentication.
 *
 * @param props - Configuration object containing URL and search parameters
 * @returns Promise that resolves to a LoginFlow object or null if the flow cannot be retrieved
 *
 * @public
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
 * Retrieves a recovery flow for password reset and account recovery.
 *
 * @param props - Configuration object containing URL and search parameters
 * @returns Promise that resolves to a RecoveryFlow object or null if the flow cannot be retrieved
 *
 * @public
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
 * Retrieves a registration flow for new user account creation.
 *
 * @param props - Configuration object containing URL and search parameters
 * @returns Promise that resolves to a RegistrationFlow object or null if the flow cannot be retrieved
 *
 * @public
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
 * Retrieves a settings flow for user account management and profile updates.
 *
 * @param props - Configuration object containing URL and search parameters
 * @returns Promise that resolves to a SettingsFlow object or null if the flow cannot be retrieved
 *
 * @public
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
 * Retrieves a verification flow for email or account verification.
 *
 * @param props - Configuration object containing URL and search parameters
 * @returns Promise that resolves to a VerificationFlow object or null if the flow cannot be retrieved
 *
 * @public
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

export type LogoutFlowReturnType = {
  flow: LogoutFlow;
  action: () => Promise<void>;
};

/**
 * Retrieves a logout flow for the authenticated user, providing both server-side
 * and client-side logout capabilities.
 *
 * @param props - Configuration object containing the return URL after logout
 * @returns Promise that resolves to a LogoutFlowReturnType object containing:
 *   - `flow`: LogoutFlow that ensures the user will log out on the auth server
 *   - `action`: Server action function that ensures logout on the browser/client by clearing cookies
 * Returns null if the flow cannot be retrieved.
 *
 * @public
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
        cookieStore.set("omnibase_postgrest_jwt", "", {
          expires: new Date(0),
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
        redirect(flow.logout_url);
      },
    };
};
