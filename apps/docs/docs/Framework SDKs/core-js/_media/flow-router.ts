import type { ReactNode } from "react";
import {
  getLoginFlow,
  getRecoveryFlow,
  getRegistrationFlow,
  getSettingsFlow,
  getVerificationFlow,
  type GetFlowProps,
} from "./get-flow";
import type {
  LoginFlow,
  RecoveryFlow,
  RegistrationFlow,
  SettingsFlow,
  VerificationFlow,
} from "@omnibase/core-js/auth";

/**
 * Maps auth flow types to their corresponding React component functions
 *
 * This type defines the structure for mapping authentication flow types to render functions.
 * Each property represents a different authentication flow, and its value is a function that
 * receives the flow data and returns a React component to render.
 *
 * @example
 * ```typescript
 * const flowMap: FlowMap = {
 *   login: (flow) => <LoginForm flow={flow} />,
 *   registration: (flow) => <RegisterForm flow={flow} />,
 *   recovery: (flow) => <RecoveryForm flow={flow} />
 * };
 * ```
 *
 * @since 0.5.1
 * @public
 * @group Flow Routing
 */
export type FlowMap = {
  /** Function that takes a LoginFlow and returns a component for user authentication */
  login?: (flow: LoginFlow) => ReactNode;
  /** Function that takes a RegistrationFlow and returns a component for user registration */
  registration?: (flow: RegistrationFlow) => ReactNode;
  /** Function that takes a RecoveryFlow and returns a component for password recovery */
  recovery?: (flow: RecoveryFlow) => ReactNode;
  /** Function that takes a VerificationFlow and returns a component for email/account verification */
  verification?: (flow: VerificationFlow) => ReactNode;
  /** Function that takes a SettingsFlow and returns a component for user settings management */
  settings?: (flow: SettingsFlow) => ReactNode;
  /** Function that takes any flow object and returns a component for custom onboarding */
  onboarding?: (flow: any) => ReactNode;
};

/**
 * Union type for all possible flow objects
 *
 * Represents any valid authentication flow object that can be returned
 * by the Ory Kratos authentication system.
 *
 * @since 0.5.1
 * @public
 * @group Flow Routing
 */
export type FlowObject =
  | LoginFlow
  | RecoveryFlow
  | RegistrationFlow
  | SettingsFlow
  | VerificationFlow;

/**
 * Retrieves the appropriate flow object based on the flow type
 *
 * This function acts as a router for authentication flows, delegating to the
 * appropriate flow retrieval function based on the flow type. It's used internally
 * by FlowRouter but can also be used independently for custom flow handling.
 *
 * @param flowType - The type of flow to retrieve (login, registration, recovery, verification, settings, onboarding)
 * @param props - Configuration object containing URL and search parameters
 * @param props.url - The UI URL for the specific flow
 * @param props.searchParams - Promise resolving to search parameters containing flow state
 *
 * @returns Promise that resolves to the corresponding flow object or null if not found/supported
 *
 * @example
 * ```typescript
 * // Retrieve a login flow
 * const loginFlow = await getFlow('login', {
 *   url: '/auth/login',
 *   searchParams: Promise.resolve({ flow: 'abc123' })
 * });
 *
 * if (loginFlow) {
 *   console.log('Login flow retrieved:', loginFlow.id);
 * }
 * ```
 *
 * @since 0.5.1
 * @public
 * @group Flow Routing
 */
export async function getFlow(
  flowType: keyof FlowMap,
  props: GetFlowProps
): Promise<FlowObject | null> {
  switch (flowType) {
    case "login":
      return await getLoginFlow(props);
    case "registration":
      return await getRegistrationFlow(props);
    case "recovery":
      return await getRecoveryFlow(props);
    case "verification":
      return await getVerificationFlow(props);
    case "settings":
      return await getSettingsFlow(props);
    case "onboarding":
      return null;
    default:
      return null;
  }
}

/**
 * Props for the FlowRouter component
 *
 * Configuration object for the FlowRouter component that handles dynamic
 * authentication flow routing in Next.js applications.
 *
 * @since 0.5.1
 * @public
 * @group Flow Routing
 */
export interface FlowRouterProps {
  /** Next.js params promise containing the flow type from dynamic route segments */
  params: Promise<{ flow: string[] }>;
  /** Map of flow types to their corresponding React component render functions */
  flowMap: FlowMap;
  /** Component to render when the requested flow type is not found or not supported */
  onNotFound?: ReactNode;
  /** Base URL path for authentication flows (e.g., '/auth') */
  url: string;
  /** Promise resolving to search parameters from the request URL */
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  /**
   * URL to redirect to after flow completion
   * @defaultValue "/"
   */
  returnTo?: string;
}

/**
 * Routes authentication flows to their corresponding components based on URL parameters
 *
 * FlowRouter is a server component that dynamically renders the appropriate authentication
 * UI based on the URL path. It fetches the flow data from Ory Kratos and passes it to
 * the corresponding render function from the flowMap. This component is designed for
 * Next.js 13+ App Router with catch-all routes.
 *
 * The router extracts the flow type from the URL (e.g., `/auth/login` → `login`),
 * retrieves the flow object, and invokes the matching render function with the flow data.
 *
 * @param props - Configuration props for the router
 * @param props.params - Next.js params promise containing flow type from route segments
 * @param props.flowMap - Map of flow types to component render functions
 * @param props.url - Base URL path for authentication flows
 * @param props.searchParams - Search parameters from the request URL
 * @param props.returnTo - URL to redirect to after flow completion (default: "/")
 * @param props.onNotFound - Optional component to render when flow is not found
 *
 * @returns Promise resolving to the rendered component for the current flow
 *
 * @example
 * ```tsx
 * // In your app/auth/[...flow]/page.tsx
 * import { FlowRouter } from '@omnibase/nextjs/auth';
 * import { LoginForm, RegistrationForm, RecoveryForm } from '@omnibase/shadcn';
 *
 * export default function AuthPage({
 *   params,
 *   searchParams
 * }: {
 *   params: Promise<{ flow: string[] }>;
 *   searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
 * }) {
 *   return (
 *     <FlowRouter
 *       params={params}
 *       searchParams={searchParams}
 *       url="/auth"
 *       returnTo="/"
 *       flowMap={{
 *         login: (flow) => <LoginForm flow={flow} register_url="/auth/registration" />,
 *         registration: (flow) => <RegistrationForm flow={flow} login_url="/auth/login" />,
 *         recovery: (flow) => <RecoveryForm flow={flow} />,
 *       }}
 *       onNotFound={<div>Authentication flow not supported</div>}
 *     />
 *   );
 * }
 * ```
 *
 * @since 0.5.1
 * @public
 * @group Flow Routing
 */
export async function FlowRouter({
  params,
  flowMap,
  onNotFound,
  url,
  returnTo = "/",
  searchParams,
}: FlowRouterProps) {
  const { flow } = await params;
  const flowType = flow[0] as keyof FlowMap;

  const componentFunction = flowMap[flowType];

  if (componentFunction) {
    if (flowType === "onboarding") return componentFunction(null);
    // Get the flow object using our getFlow function
    const flowObject = await getFlow(flowType, { url, searchParams });

    if (flowObject) {
      // Call the component function with the flow object
      return componentFunction(flowObject as any);
    }
  }

  return onNotFound;
}
