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
 */
export type FlowMap = {
  /** Function that takes a LoginFlow and returns a component */
  login?: (flow: LoginFlow) => ReactNode;
  /** Function that takes a RegistrationFlow and returns a component */
  registration?: (flow: RegistrationFlow) => ReactNode;
  /** Function that takes a RecoveryFlow and returns a component */
  recovery?: (flow: RecoveryFlow) => ReactNode;
  /** Function that takes a VerificationFlow and returns a component */
  verification?: (flow: VerificationFlow) => ReactNode;
  /** Function that takes a SettingsFlow and returns a component */
  settings?: (flow: SettingsFlow) => ReactNode;
  /** Function that takes any flow object and returns a component (for onboarding) */
  onboarding?: (flow: any) => ReactNode;
};

/**
 * Union type for all possible flow objects
 */
export type FlowObject =
  | LoginFlow
  | RecoveryFlow
  | RegistrationFlow
  | SettingsFlow
  | VerificationFlow;

/**
 * Retrieves the appropriate flow object based on the flow type.
 *
 * @param flowType - The type of flow to retrieve (login, registration, recovery, verification, settings)
 * @param props - Configuration object containing URL and search parameters
 * @returns Promise that resolves to the corresponding flow object or null if not found/supported
 *
 * @example
 * ```tsx
 * const flow = await getFlow('login', {
 *   url: '/auth/login',
 *   searchParams: Promise.resolve({ flow: 'abc123' })
 * });
 * ```
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
 */
export interface FlowRouterProps {
  /** NextJS params containing the flow type */
  params: Promise<{ flow: string[] }>;
  /** Map of flow types to React component functions */
  flowMap: FlowMap;
  /** Component to render when flow type is not found */
  onNotFound?: ReactNode;
  /** URL for the current flow */
  url: string;
  /** Search parameters from the request */
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  /** Return to URL after flow completed */
  returnTo: string;
}

/**
 * Routes auth flows to their corresponding components based on URL parameters.
 *
 * @param props - The router props
 * @returns The component for the current flow type
 *
 * @example
 * ```tsx
 * // In your app/auth/[...flow]/page.tsx
 * import { FlowRouter } from '@omnibase/nextjs';
 * import { LoginForm, RegisterForm } from './components';
 *
 * export default function AuthPage({
 *   params,
 *   searchParams
 * }: {
 *   params: Promise<{ flow: string[] }>;
 *   searchParams: Promise<{ [key: string]: string | string[] | undefined; }>;
 * }) {
 *   return (
 *     <FlowRouter
 *       params={params}
 *       searchParams={searchParams}
 *       url="/auth"
 *       flowMap={{
 *         login: (flow) => <LoginForm flow={flow} />,
 *         registration: (flow) => <RegisterForm flow={flow} />,
 *       }}
 *       onNotFound={<div>Auth flow not supported</div>}
 *     />
 *   );
 * }
 * ```
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
