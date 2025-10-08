import type { OmnibaseClient } from "@omnibase/core-js";

/**
 * Handler for relationship-based permission operations
 *
 * This class manages permission relationships using Ory Keto's relationship tuple model.
 * It provides server action methods for creating and deleting relationships between
 * subjects (typically users) and objects (resources like tenants, documents, etc.).
 *
 * Each relationship tuple consists of:
 * - **namespace**: A logical grouping (e.g., "tenants", "documents")
 * - **object**: The resource identifier (e.g., "tenant:123", "document:456")
 * - **relation**: The type of relationship (e.g., "member", "owner", "viewer")
 * - **subject_id**: The subject identifier (e.g., "user:789")
 *
 * All methods are designed to work as Next.js server actions, accepting FormData
 * from form submissions and returning success/error states compatible with
 * React's useFormState hook.
 *
 * @example
 * Basic usage in a server component:
 * ```typescript
 * import { PermissionActionsHandler } from '@omnibase/nextjs/permissions';
 * import { createServerClient } from '@omnibase/nextjs';
 *
 * const client = createServerClient();
 * const permissions = new PermissionActionsHandler(client);
 *
 * // Bind methods for use as server actions
 * const createRelationship = permissions.relationship.create.bind(
 *   permissions.relationship
 * );
 *
 * export default function GrantPermissionForm() {
 *   return (
 *     <form action={createRelationship}>
 *       <input name="namespace" defaultValue="tenants" />
 *       <input name="object" placeholder="tenant:123" />
 *       <input name="relation" defaultValue="member" />
 *       <input name="subject_id" placeholder="user:456" />
 *       <button type="submit">Grant Permission</button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Relationships
 */
export class RelationshipHandler {
  /**
   * Creates a new RelationshipHandler instance
   *
   * @param omnibaseClient - The Omnibase client instance for API communication
   *
   * @group Relationships
   */
  constructor(private omnibaseClient: OmnibaseClient) {}

  /**
   * Creates a new permission relationship
   *
   * This server action creates a relationship tuple in Ory Keto, granting
   * a subject (user) a specific relation to an object (resource). The relationship
   * is immediately active and can be checked using permission queries.
   *
   * This method is designed to be used as a Next.js server action with FormData,
   * making it compatible with React Server Components and the useFormState hook.
   *
   * @param prevState - Previous form state (for React useFormState compatibility)
   * @param formData - Form data containing relationship parameters
   *
   * @returns Promise resolving to success state
   *
   * @throws {Error} When required form fields are missing
   * @throws {Error} When the API request fails or returns invalid data
   *
   * @example
   * Using with a form in a server component:
   * ```typescript
   * import { PermissionActionsHandler } from '@omnibase/nextjs/permissions';
   * import { createServerClient } from '@omnibase/nextjs';
   *
   * export default function GrantAccessForm() {
   *   const client = createServerClient();
   *   const permissions = new PermissionActionsHandler(client);
   *
   *   return (
   *     <form action={permissions.relationship.create.bind(permissions.relationship)}>
   *       <input name="namespace" value="tenants" hidden />
   *       <input name="object" placeholder="tenant:123" required />
   *       <input name="relation" value="member" hidden />
   *       <input name="subject_id" placeholder="user:456" required />
   *       <button type="submit">Grant Access</button>
   *     </form>
   *   );
   * }
   * ```
   *
   * @example
   * Using with useFormState in a client component:
   * ```typescript
   * 'use client';
   * import { useFormState } from 'react-dom';
   * import { createRelationshipAction } from './actions';
   *
   * export function GrantAccessForm() {
   *   const [state, formAction] = useFormState(createRelationshipAction, null);
   *
   *   return (
   *     <form action={formAction}>
   *       <input name="namespace" defaultValue="tenants" />
   *       <input name="object" placeholder="tenant:123" />
   *       <input name="relation" defaultValue="member" />
   *       <input name="subject_id" placeholder="user:456" />
   *       <button type="submit">Grant Permission</button>
   *       {state?.success && <p>Permission granted!</p>}
   *     </form>
   *   );
   * }
   * ```
   *
   * @since 1.0.0
   * @group Relationships
   */
  async create(prevState: any, formData: FormData) {
    const data = extractCreateData(formData);
    const response =
      await this.omnibaseClient.permissions.relationships.createRelationship({
        createRelationshipBody: data,
      });

    if (!response.data) {
      throw new Error(
        "Response was not an error, but no data was retrieved from `relationships.create()`"
      );
    }

    return {
      success: true,
    };
  }

  /**
   * Deletes an existing permission relationship
   *
   * This server action removes a relationship tuple from Ory Keto, revoking
   * a subject's (user's) specific relation to an object (resource). The permission
   * is immediately revoked and subsequent permission checks will reflect this change.
   *
   * This method is designed to be used as a Next.js server action with FormData,
   * making it compatible with React Server Components and the useFormState hook.
   *
   * @param prevState - Previous form state (for React useFormState compatibility)
   * @param formData - Form data containing relationship parameters to delete
   *
   * @returns Promise resolving to success state
   *
   * @throws {Error} When required form fields are missing
   * @throws {Error} When the API response status is not 204 (No Content)
   *
   * @example
   * Using with a form in a server component:
   * ```typescript
   * import { PermissionActionsHandler } from '@omnibase/nextjs/permissions';
   * import { createServerClient } from '@omnibase/nextjs';
   *
   * export default function RevokeAccessForm() {
   *   const client = createServerClient();
   *   const permissions = new PermissionActionsHandler(client);
   *
   *   return (
   *     <form action={permissions.relationship.delete.bind(permissions.relationship)}>
   *       <input name="namespace" value="tenants" hidden />
   *       <input name="object" placeholder="tenant:123" required />
   *       <input name="relation" value="member" hidden />
   *       <input name="subject_id" placeholder="user:456" required />
   *       <button type="submit">Revoke Access</button>
   *     </form>
   *   );
   * }
   * ```
   *
   * @example
   * Using with useFormState in a client component:
   * ```typescript
   * 'use client';
   * import { useFormState } from 'react-dom';
   * import { deleteRelationshipAction } from './actions';
   *
   * export function RevokeAccessForm() {
   *   const [state, formAction] = useFormState(deleteRelationshipAction, null);
   *
   *   return (
   *     <form action={formAction}>
   *       <input name="namespace" defaultValue="tenants" />
   *       <input name="object" placeholder="tenant:123" />
   *       <input name="relation" defaultValue="member" />
   *       <input name="subject_id" placeholder="user:456" />
   *       <button type="submit">Revoke Permission</button>
   *       {state?.success && <p>Permission revoked!</p>}
   *     </form>
   *   );
   * }
   * ```
   *
   * @since 1.0.0
   * @group Relationships
   */
  async delete(prevState: any, formData: FormData) {
    const data = extractCreateData(formData);
    const response =
      await this.omnibaseClient.permissions.relationships.deleteRelationships({
        namespace: data.namespace,
        object: data.object,
        relation: data.relation,
        subjectId: data.subject_id,
      });

    if (response.status != 204) {
      console.log(response.status);
      throw new Error("Response was not `204`");
    }

    return {
      success: true,
    };
  }
}

/**
 * Extracts and validates relationship data from FormData
 *
 * This internal helper function parses FormData from form submissions and
 * extracts the required fields for creating or deleting permission relationships.
 * It validates that all required fields are present and returns a properly
 * typed object for use with the Ory Keto API.
 *
 * Required FormData fields:
 * - **namespace**: The permission namespace (e.g., "tenants")
 * - **object**: The resource identifier (e.g., "tenant:123")
 * - **relation**: The relationship type (e.g., "member", "owner")
 * - **subject_id**: The subject identifier (e.g., "user:456")
 *
 * @param formData - The FormData object from form submission
 *
 * @returns Validated relationship data object
 *
 * @throws {Error} When any required field is missing or empty
 *
 * @example
 * Example FormData structure:
 * ```typescript
 * const formData = new FormData();
 * formData.append('namespace', 'tenants');
 * formData.append('object', 'tenant:123');
 * formData.append('relation', 'member');
 * formData.append('subject_id', 'user:456');
 *
 * const data = extractCreateData(formData);
 * // Returns:
 * // {
 * //   namespace: 'tenants',
 * //   object: 'tenant:123',
 * //   relation: 'member',
 * //   subject_id: 'user:456'
 * // }
 * ```
 *
 * @internal
 */
const extractCreateData = (formData: FormData) => {
  const namespace = formData.get("namespace") as string;
  const object = formData.get("object") as string;
  const relation = formData.get("relation") as string;
  const subject_id = formData.get("subject_id") as string;

  if (!namespace || !object || !relation || !subject_id) {
    throw new Error("All form inputs not filled in");
  }

  return {
    namespace,
    object,
    relation,
    subject_id,
  };
};
