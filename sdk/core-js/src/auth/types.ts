import type {
  LoginFlow as Login,
  RegistrationFlow as Registration,
  RecoveryFlow as Recovery,
  VerificationFlow as Verification,
  SettingsFlow as Settings,
  LogoutFlow as Logout,
  SessionAuthenticationMethod,
  AuthenticatorAssuranceLevel,
  SessionDevice,
  Identity,
} from "@ory/client-fetch";

/**
 * Union type representing all possible authentication flow types
 *
 * This type encompasses all self-service authentication flows supported by Ory Kratos.
 * Each flow type has its own specific structure and validation rules, but they all
 * follow the same general pattern of initialization, form rendering, and submission.
 *
 * @example
 * Type guard for flow identification:
 * ```typescript
 * function isLoginFlow(flow: FlowType): flow is LoginFlow {
 *   return flow.type === 'login';
 * }
 *
 * function handleFlow(flow: FlowType) {
 *   if (isLoginFlow(flow)) {
 *     // Handle login-specific logic
 *     console.log('Processing login flow:', flow.id);
 *   }
 * }
 * ```
 *
 * @example
 * Generic flow processing:
 * ```typescript
 * function processFlowUI(flow: FlowType) {
 *   return flow.ui.nodes.map(node => ({
 *     name: node.attributes.name,
 *     type: node.type,
 *     required: node.attributes.required || false
 *   }));
 * }
 * ```
 *
 * @since 0.1.0
 * @public
 */
export type FlowType =
  | LoginFlow
  | RecoveryFlow
  | VerificationFlow
  | RegistrationFlow
  | SettingsFlow;

/**
 * Logout flow for terminating user sessions
 *
 * The logout flow ensures that user sessions are properly terminated on the
 * authentication server. This flow handles both cookie-based and token-based
 * session termination, providing secure logout functionality across different
 * authentication methods.
 *
 * @example
 * Initiating logout flow:
 * ```typescript
 * // Browser-based logout
 * window.location.href = logoutFlow.logout_url;
 *
 * // Or for SPA/API-based logout
 * await fetch(logoutFlow.logout_url, {
 *   method: 'GET',
 *   credentials: 'include'
 * });
 * ```
 *
 * @since 0.1.0
 * @public
 */
export type LogoutFlow = Logout;

/**
 * Login flow for user authentication
 *
 * Represents a complete login flow initiated through Ory Kratos. This flow handles
 * various authentication methods including password-based login, social providers,
 * and multi-factor authentication. The flow contains all necessary UI elements
 * and validation rules for rendering secure login forms.
 *
 * Key properties:
 * - `ui`: Contains form nodes with input fields, buttons, and validation messages
 * - `oauth2_login_challenge`: OAuth2 challenge for federated login scenarios
 * - `refresh`: Indicates if this is a forced re-authentication
 * - `request_url`: Original URL that initiated the flow
 *
 * @example
 * Processing login form:
 * ```typescript
 * function renderLoginForm(flow: LoginFlow) {
 *   const emailField = flow.ui.nodes.find(
 *     node => node.attributes.name === 'identifier'
 *   );
 *   const passwordField = flow.ui.nodes.find(
 *     node => node.attributes.name === 'password'
 *   );
 *
 *   // Render form with these fields
 *   return {
 *     action: flow.ui.action,
 *     method: flow.ui.method,
 *     fields: [emailField, passwordField]
 *   };
 * }
 * ```
 *
 * @example
 * Handling social login:
 * ```typescript
 * function getSocialProviders(flow: LoginFlow) {
 *   return flow.ui.nodes
 *     .filter(node => node.group === 'oidc')
 *     .map(node => ({
 *       provider: node.attributes.value,
 *       name: node.meta?.label?.text || 'Unknown Provider'
 *     }));
 * }
 * ```
 *
 * @since 0.1.0
 * @public
 */
export type LoginFlow = Login;

/**
 * Account recovery flow for password reset and account recovery
 *
 * This flow enables users to recover their accounts through various recovery
 * methods such as email-based password reset or account unlock procedures.
 * The recovery process is typically initiated when a user cannot access their
 * account due to forgotten credentials or account lockout.
 *
 * @example
 * Initiating account recovery:
 * ```typescript
 * function handleRecovery(flow: RecoveryFlow) {
 *   const emailField = flow.ui.nodes.find(
 *     node => node.attributes.name === 'email'
 *   );
 *
 *   if (emailField) {
 *     // Render email input for recovery
 *     return {
 *       action: flow.ui.action,
 *       method: flow.ui.method,
 *       placeholder: 'Enter your email address'
 *     };
 *   }
 * }
 * ```
 *
 * @since 0.1.0
 * @public
 */
export type RecoveryFlow = Recovery;

/**
 * Verification flow for validating communication channels
 *
 * Used to verify out-of-band communication channels such as email addresses
 * or phone numbers. This flow ensures that users have access to the contact
 * methods they've provided, which is essential for account security and
 * communication delivery.
 *
 * @example
 * Email verification handling:
 * ```typescript
 * function handleEmailVerification(flow: VerificationFlow) {
 *   if (flow.state === 'sent_email') {
 *     return {
 *       message: 'Verification email sent. Please check your inbox.',
 *       canResend: true
 *     };
 *   }
 *
 *   if (flow.state === 'passed_challenge') {
 *     return {
 *       message: 'Email verified successfully!',
 *       redirect: '/dashboard'
 *     };
 *   }
 * }
 * ```
 *
 * @since 0.1.0
 * @public
 */
export type VerificationFlow = Verification;

/**
 * Registration flow for new user account creation
 *
 * Handles the complete user registration process including identity validation,
 * password requirements, and any custom registration fields defined in the
 * identity schema. The registration flow can include email verification,
 * terms acceptance, and integration with external identity providers.
 *
 * @example
 * Processing registration form:
 * ```typescript
 * function buildRegistrationForm(flow: RegistrationFlow) {
 *   const passwordNode = flow.ui.nodes.find(
 *     node => node.attributes.name === 'password'
 *   );
 *
 *   const requirements = passwordNode?.messages?.map(msg => msg.text) || [];
 *
 *   return {
 *     action: flow.ui.action,
 *     method: flow.ui.method,
 *     passwordRequirements: requirements,
 *     hasTerms: flow.ui.nodes.some(node => node.attributes.name === 'terms')
 *   };
 * }
 * ```
 *
 * @example
 * Handling registration validation:
 * ```typescript
 * function getRegistrationErrors(flow: RegistrationFlow) {
 *   return flow.ui.nodes.reduce((errors, node) => {
 *     if (node.messages && node.messages.length > 0) {
 *       errors[node.attributes.name] = node.messages[0].text;
 *     }
 *     return errors;
 *   }, {} as Record<string, string>);
 * }
 * ```
 *
 * @since 0.1.0
 * @public
 */
export type RegistrationFlow = Registration;

/**
 * Settings flow for user profile and account management
 *
 * This flow enables users to update their account settings in a self-service manner.
 * It supports updating profile information, changing passwords, managing two-factor
 * authentication, updating email addresses, and other account-related settings.
 * The flow enforces proper validation and security measures for sensitive changes.
 *
 * @example
 * Profile update handling:
 * ```typescript
 * function handleProfileSettings(flow: SettingsFlow) {
 *   const profileFields = flow.ui.nodes
 *     .filter(node => node.group === 'profile')
 *     .map(node => ({
 *       name: node.attributes.name,
 *       value: node.attributes.value,
 *       type: node.attributes.type,
 *       required: node.attributes.required
 *     }));
 *
 *   return {
 *     action: flow.ui.action,
 *     method: flow.ui.method,
 *     fields: profileFields
 *   };
 * }
 * ```
 *
 * @example
 * Password change flow:
 * ```typescript
 * function handlePasswordChange(flow: SettingsFlow) {
 *   const passwordNodes = flow.ui.nodes.filter(
 *     node => node.group === 'password'
 *   );
 *
 *   return passwordNodes.map(node => ({
 *     name: node.attributes.name,
 *     label: node.meta?.label?.text || node.attributes.name,
 *     required: node.attributes.required || false
 *   }));
 * }
 * ```
 *
 * @since 0.1.0
 * @public
 */
export type SettingsFlow = Settings;

/**
 * User session object representing an authenticated user's session state
 *
 * A session contains all information about a user's authentication state,
 * including when they authenticated, what methods were used, device information,
 * and the associated identity. Sessions have expiration times and can be
 * invalidated when users log out or when security policies require it.
 *
 * Sessions are central to maintaining authentication state across requests
 * and provide the foundation for authorization decisions throughout your
 * application.
 *
 * @example
 * Checking session validity:
 * ```typescript
 * function isSessionValid(session: Session): boolean {
 *   if (!session.active) {
 *     return false;
 *   }
 *
 *   if (session.expires_at && new Date(session.expires_at) < new Date()) {
 *     return false;
 *   }
 *
 *   return true;
 * }
 * ```
 *
 * @example
 * Extracting user information:
 * ```typescript
 * function getUserInfo(session: Session) {
 *   return {
 *     id: session.identity?.id,
 *     email: session.identity?.traits?.email,
 *     name: session.identity?.traits?.name,
 *     isVerified: session.identity?.verifiable_addresses?.some(
 *       addr => addr.verified
 *     ) || false
 *   };
 * }
 * ```
 *
 * @example
 * Session security analysis:
 * ```typescript
 * function analyzeSessionSecurity(session: Session) {
 *   const authMethods = session.authentication_methods || [];
 *   const hasMFA = authMethods.length > 1;
 *   const recentAuth = session.authenticated_at &&
 *     new Date(session.authenticated_at) > new Date(Date.now() - 3600000); // 1 hour
 *
 *   return {
 *     hasMFA,
 *     recentAuth,
 *     assuranceLevel: session.authenticator_assurance_level,
 *     deviceCount: session.devices?.length || 0
 *   };
 * }
 * ```
 *
 * @since 0.1.0
 * @public
 */
export type Session = {
  /**
   * Session active state
   *
   * Indicates whether the session is currently active and valid for
   * authentication purposes. When false, the session should be treated
   * as invalid regardless of expiration time.
   *
   * @defaultValue true
   */
  active?: boolean;

  /**
   * Session authentication timestamp
   *
   * The exact time when this session was authenticated. For multi-factor
   * authentication scenarios, this represents when the last factor was
   * successfully verified (e.g., TOTP code completion, biometric verification).
   *
   * This timestamp is crucial for implementing security policies that require
   * recent authentication for sensitive operations.
   */
  authenticated_at?: Date;

  /**
   * Authentication methods used for this session
   *
   * A comprehensive list of all authentication methods used to establish
   * this session. This includes passwords, social logins, multi-factor
   * authentication tokens, and any other verification methods.
   *
   * Useful for implementing step-up authentication or authorization decisions
   * based on authentication strength.
   */
  authentication_methods?: Array<SessionAuthenticationMethod>;

  /**
   * Authenticator assurance level
   *
   * Indicates the confidence level in the user's identity based on the
   * authentication methods used. Higher assurance levels typically require
   * multiple factors or stronger authentication methods.
   *
   * Common levels:
   * - `aal1`: Single-factor authentication (password, social login)
   * - `aal2`: Multi-factor authentication (password + TOTP, biometrics)
   */
  authenticator_assurance_level?: AuthenticatorAssuranceLevel;

  /**
   * Session device history
   *
   * Complete history of all devices and endpoints where this session
   * has been used. This information is valuable for security monitoring,
   * anomaly detection, and providing users with visibility into their
   * account access patterns.
   *
   * Each device entry includes IP address, user agent, location data,
   * and timestamp information for comprehensive session tracking.
   */
  devices?: Array<SessionDevice>;

  /**
   * Session expiration timestamp
   *
   * The exact time when this session expires and becomes invalid.
   * After this time, the session should not be accepted for authentication
   * and the user should be required to log in again.
   *
   * Session expiration can be extended through refresh tokens or
   * re-authentication flows depending on your application's security policy.
   */
  expires_at?: Date;

  /**
   * Unique session identifier
   *
   * A unique identifier for this session that can be used for session
   * management operations such as invalidation, refresh, or audit logging.
   * This ID is typically used in session storage and tracking systems.
   */
  id: string;

  /**
   * Associated user identity
   *
   * The complete identity object of the authenticated user, containing
   * all user profile information, traits, verifiable addresses, and
   * recovery addresses. This is the primary source of user information
   * for the session.
   *
   * The identity structure is defined by your identity schema and may
   * include custom fields specific to your application's user model.
   */
  identity?: Identity;

  /**
   * Session issuance timestamp
   *
   * The time when this session was initially created and issued.
   * This is typically equal to or very close to `authenticated_at`,
   * but may differ in cases where session creation and authentication
   * are separate operations.
   *
   * Useful for implementing session age limits and security policies
   * that consider the total session lifetime.
   */
  issued_at?: Date;

  /**
   * Tokenized session representation
   *
   * A tokenized version of the session, typically in JWT format, that
   * can be used for stateless authentication scenarios. This field is
   * only populated when specifically requested through the `tokenize_as`
   * query parameter during session retrieval.
   *
   * The tokenized session contains essential session information in a
   * cryptographically signed format, allowing for distributed authentication
   * without requiring centralized session storage lookups.
   *
   * @example
   * Using tokenized session:
   * ```typescript
   * if (session.tokenized) {
   *   // Use JWT token for API authentication
   *   localStorage.setItem('auth_token', session.tokenized);
   * }
   * ```
   */
  tokenized?: string;
};
