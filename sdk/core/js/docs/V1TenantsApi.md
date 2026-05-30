# V1TenantsApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**acceptInvite**](V1TenantsApi.md#acceptinviteoperation) | **PUT** /api/v1/tenants/invites/accept | Accept tenant invite |
| [**addSubscription**](V1TenantsApi.md#addsubscriptionoperation) | **POST** /api/v1/tenants/subscriptions | Add subscription |
| [**createInvite**](V1TenantsApi.md#createinvite) | **POST** /api/v1/tenants/invites | Create tenant invite |
| [**createRole**](V1TenantsApi.md#createroleoperation) | **POST** /api/v1/tenants/roles | Create role |
| [**createTenant**](V1TenantsApi.md#createtenantoperation) | **POST** /api/v1/tenants | Create tenant |
| [**deleteRole**](V1TenantsApi.md#deleterole) | **DELETE** /api/v1/tenants/roles/{role_id} | Delete role |
| [**deleteTenant**](V1TenantsApi.md#deletetenant) | **DELETE** /api/v1/tenants | Delete tenant |
| [**getRoleDefinitions**](V1TenantsApi.md#getroledefinitions) | **GET** /api/v1/tenants/roles/definitions | Get namespace definitions |
| [**getTenantBillingStatus**](V1TenantsApi.md#gettenantbillingstatus) | **GET** /api/v1/tenants/billing-status | Get billing status |
| [**getTenantByID**](V1TenantsApi.md#gettenantbyid) | **GET** /api/v1/tenants/by-id/{tenant_id} | Get tenant by ID |
| [**getTenantByStripeCustomerID**](V1TenantsApi.md#gettenantbystripecustomerid) | **GET** /api/v1/tenants/by-stripe-customer/{stripe_customer_id} | Get tenant by Stripe customer ID |
| [**getTenantJWT**](V1TenantsApi.md#gettenantjwt) | **GET** /api/v1/tenants/jwt | Get PostgREST JWT token |
| [**getTenantSubscription**](V1TenantsApi.md#gettenantsubscription) | **GET** /api/v1/tenants/subscriptions/{config_price_id} | Get tenant subscription by plan |
| [**listRoles**](V1TenantsApi.md#listroles) | **GET** /api/v1/tenants/roles | List roles |
| [**listTenantSubscriptions**](V1TenantsApi.md#listtenantsubscriptions) | **GET** /api/v1/tenants/subscriptions | Get tenant subscriptions |
| [**listTenantUsers**](V1TenantsApi.md#listtenantusers) | **GET** /api/v1/tenants/users | Get tenant users |
| [**removeSubscription**](V1TenantsApi.md#removesubscriptionoperation) | **DELETE** /api/v1/tenants/subscriptions | Remove subscription |
| [**removeTenantUser**](V1TenantsApi.md#removetenantuser) | **DELETE** /api/v1/tenants/users | Remove tenant user |
| [**switchActiveTenant**](V1TenantsApi.md#switchactivetenant) | **PUT** /api/v1/tenants/switch-active | Switch active tenant |
| [**updateRole**](V1TenantsApi.md#updateroleoperation) | **PUT** /api/v1/tenants/roles/{role_id} | Update role |
| [**updateTenantUserRole**](V1TenantsApi.md#updatetenantuserroleoperation) | **PUT** /api/v1/tenants/users | Update user role |



## acceptInvite

> AcceptInvite200Response acceptInvite(acceptInviteRequest, xUserId)

Accept tenant invite

Accepts a tenant invitation using the token from the invite email and adds the user to the organization.  ## Authentication - **Session Auth**: Requires JWT token / Cookie Session - User\&#39;s email must match the invite email - **Service Key Auth**: Requires X-Service-Key + X-User-ID header  ## Process 1. Validates invite token and expiry 2. Verifies user\&#39;s email matches invite email 3. Marks invite as used 4. Adds user to tenant 5. Assigns role with permissions 6. Sets as active tenant and returns JWT token 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { AcceptInviteOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // AcceptInviteRequest
    acceptInviteRequest: ...,
    // string | User ID (UUID) - Required when using X-Service-Key header (optional)
    xUserId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies AcceptInviteOperationRequest;

  try {
    const data = await api.acceptInvite(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **acceptInviteRequest** | [AcceptInviteRequest](AcceptInviteRequest.md) |  | |
| **xUserId** | `string` | User ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |

### Return type

[**AcceptInvite200Response**](AcceptInvite200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successfully joined organization |  -  |
| **400** | Invalid or expired invite token |  -  |
| **401** | User not authenticated |  -  |
| **403** | Email mismatch - invite sent to different address |  -  |
| **500** | Failed to accept invite |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## addSubscription

> AddSubscription200Response addSubscription(addSubscriptionRequest)

Add subscription

Adds a Stripe subscription for the authenticated tenant using the provided plan ID.  ## Authentication Requires JWT token with tenant context.  ## Request Parameters - **plan_id** (required): The configuration item ID (e.g., \&quot;neon_compute_starter\&quot;) that maps to a Stripe price - **stripe_customer_id** (optional): Override tenant\&#39;s Stripe customer ID if needed  ## Process Flow 1. Validates the plan_id and maps it to a Stripe price_id via the stripe_id_mappings table 2. Resolves the Stripe customer ID from the authenticated tenant (or uses provided stripe_customer_id) 3. Checks if subscription already exists for this plan to prevent duplicates 4. Creates the subscription in Stripe with the specified price 5. Returns the subscription ID and status  ## Notes - If a subscription for this plan already exists, returns a 400 error - The subscription is created immediately and begins billing  ## Use Cases - Subscribe tenant to metered pricing plans (compute, storage, workers) - Enable usage-based billing for resources - Add additional services to tenant\&#39;s billing 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { AddSubscriptionOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // AddSubscriptionRequest
    addSubscriptionRequest: ...,
  } satisfies AddSubscriptionOperationRequest;

  try {
    const data = await api.addSubscription(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **addSubscriptionRequest** | [AddSubscriptionRequest](AddSubscriptionRequest.md) |  | |

### Return type

[**AddSubscription200Response**](AddSubscription200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Subscription added successfully |  -  |
| **400** | Bad request - Invalid or missing required headers/body |  -  |
| **401** | User not authenticated |  -  |
| **404** | Plan not found - no Stripe price mapping found for the provided plan_id |  -  |
| **500** | Failed to create subscription or fetch tenant |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createInvite

> CreateInvite200Response createInvite(createTenantUserInviteRequest, xUserId, xTenantId)

Create tenant invite

Creates a tenant invitation with a 7-day expiry token and sends an email to the invited user.  ## Authentication - **Session Auth**: Requires JWT token / Cookie Session with &#x60;invite_user&#x60; permission - **Service Key Auth**: Requires X-Service-Key + X-Tenant-ID + X-User-ID headers with &#x60;invite_user&#x60; permission  ## Process 1. Verifies user has invite permission 2. Creates invite with unique token (7-day expiry) 3. Sends invitation email asynchronously  ## Use Cases - Add team members to organization - Invite collaborators with specific roles 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { CreateInviteRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // CreateTenantUserInviteRequest
    createTenantUserInviteRequest: ...,
    // string | User ID (UUID) - Required when using X-Service-Key header (optional)
    xUserId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)
    xTenantId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies CreateInviteRequest;

  try {
    const data = await api.createInvite(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **createTenantUserInviteRequest** | [CreateTenantUserInviteRequest](CreateTenantUserInviteRequest.md) |  | |
| **xUserId** | `string` | User ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |
| **xTenantId** | `string` | Tenant ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |

### Return type

[**CreateInvite200Response**](CreateInvite200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Invite sent successfully |  -  |
| **400** | Bad request - Invalid or missing required headers/body |  -  |
| **401** | User not authenticated |  -  |
| **403** | Insufficient permissions to invite users |  -  |
| **404** | Tenant not found |  -  |
| **500** | Failed to create invite |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createRole

> CreateRole200Response createRole(createRoleRequest, xUserId, xTenantId)

Create role

Creates a new custom role for the tenant with specified permissions.  ## Authentication - **Session Auth**: Requires JWT token / Cookie Session with tenant context and appropriate permissions - **Service Key Auth**: Requires X-Service-Key + X-Tenant-ID + X-User-ID headers with appropriate permissions  ## Permission Format Permissions should be in the format: &#x60;namespace:resource#relation&#x60; - Tenant-wide: &#x60;tenant#relation&#x60; - Resource-specific: &#x60;project:uuid#relation&#x60;  ## Use Cases - Create custom roles for specific workflows - Define project-specific permissions - Build granular access control 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { CreateRoleOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // CreateRoleRequest
    createRoleRequest: ...,
    // string | User ID (UUID) - Required when using X-Service-Key header (optional)
    xUserId: 550e8400-e29b-41d4-a716-446655440000,
    // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)
    xTenantId: 31c60057-bd7c-41b8-b96e-c4ceb845034f,
  } satisfies CreateRoleOperationRequest;

  try {
    const data = await api.createRole(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **createRoleRequest** | [CreateRoleRequest](CreateRoleRequest.md) |  | |
| **xUserId** | `string` | User ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |
| **xTenantId** | `string` | Tenant ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |

### Return type

[**CreateRole200Response**](CreateRole200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Role created successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Invalid or missing JWT token |  -  |
| **403** | Forbidden - Insufficient permissions |  -  |
| **409** | Role with this name already exists for tenant |  -  |
| **500** | Failed to create role |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createTenant

> CreateTenant200Response createTenant(createTenantRequest, xUserId)

Create tenant

Creates a new tenant organization with Stripe customer, sets up owner role, and makes it the active tenant for the creator.  ## Authentication - **Session Auth**: Requires JWT token / Cookie Session (user_id extracted from session) - **Service Key Auth**: Requires X-Service-Key + X-User-ID headers  ## Service Key Usage When using service key authentication, provide the user_id via the X-User-ID header. The user_id must be a valid UUID matching an existing Kratos identity.  ## Process 1. Creates Stripe customer (if billing_email provided) 2. Creates tenant in database 3. Sets up default tenant settings 4. Adds creator as owner 5. Assigns owner role with all permissions 6. Sets as active tenant and returns JWT token 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { CreateTenantOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // CreateTenantRequest
    createTenantRequest: ...,
    // string | User ID (UUID) - Required when using service key authentication (optional)
    xUserId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies CreateTenantOperationRequest;

  try {
    const data = await api.createTenant(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **createTenantRequest** | [CreateTenantRequest](CreateTenantRequest.md) |  | |
| **xUserId** | `string` | User ID (UUID) - Required when using service key authentication | [Optional] [Defaults to `undefined`] |

### Return type

[**CreateTenant200Response**](CreateTenant200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Tenant created successfully |  -  |
| **400** | Bad request - Invalid or missing required headers/body |  -  |
| **401** | Invalid or missing JWT token |  -  |
| **500** | Failed to create tenant |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteRole

> DeleteRole200Response deleteRole(roleId, xUserId, xTenantId)

Delete role

Deletes a role and removes all associated Keto relationships for users who had this role assigned.  ## Authentication - **Session Auth**: Requires JWT token / Cookie Session with tenant context and appropriate permissions - **Service Key Auth**: Requires X-Service-Key + X-Tenant-ID + X-User-ID headers with appropriate permissions  ## Use Cases - Remove obsolete roles - Clean up role definitions - Revoke all permissions from role users 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { DeleteRoleRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // string | Role ID
    roleId: roleId_example,
    // string | User ID (UUID) - Required when using X-Service-Key header (optional)
    xUserId: 550e8400-e29b-41d4-a716-446655440000,
    // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)
    xTenantId: 31c60057-bd7c-41b8-b96e-c4ceb845034f,
  } satisfies DeleteRoleRequest;

  try {
    const data = await api.deleteRole(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **roleId** | `string` | Role ID | [Defaults to `undefined`] |
| **xUserId** | `string` | User ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |
| **xTenantId** | `string` | Tenant ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |

### Return type

[**DeleteRole200Response**](DeleteRole200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Role deleted successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Invalid or missing JWT token |  -  |
| **403** | Forbidden - Insufficient permissions |  -  |
| **404** | Role not found |  -  |
| **500** | Failed to delete role |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteTenant

> DeleteTenant200Response deleteTenant(xUserId, xTenantId)

Delete tenant

Deletes a tenant organization and performs cleanup of Stripe customer, Keto permissions, and user associations.  ## Authentication - **Session Auth**: Requires JWT token / Cookie Session with &#x60;delete_tenant&#x60; permission - **Service Key Auth**: Requires X-Service-Key + X-Tenant-ID + X-User-ID headers with &#x60;delete_tenant&#x60; permission  ## Process 1. Verifies user has delete permission 2. Archives Stripe customer 3. Deletes tenant (cascades to users, settings, invites) 4. Cleans up all affected users\&#39; tenant state 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { DeleteTenantRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // string | User ID (UUID) - Required when using X-Service-Key header (optional)
    xUserId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)
    xTenantId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies DeleteTenantRequest;

  try {
    const data = await api.deleteTenant(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **xUserId** | `string` | User ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |
| **xTenantId** | `string` | Tenant ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |

### Return type

[**DeleteTenant200Response**](DeleteTenant200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Tenant deleted successfully |  -  |
| **400** | Bad request - Invalid or missing required headers/body |  -  |
| **401** | User not authenticated |  -  |
| **403** | Insufficient permissions to delete tenant |  -  |
| **404** | Tenant not found |  -  |
| **409** | Tenant has associated resources that must be deleted first |  -  |
| **500** | Failed to delete tenant |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getRoleDefinitions

> GetRoleDefinitions200Response getRoleDefinitions(subject)

Get namespace definitions

Returns all available permission namespaces and their relations from the database.  ## Authentication Requires JWT token with appropriate permissions.  ## Use Cases - Discover available permission namespaces - List relations for each namespace - Build dynamic permission UIs - Filter by subject type for API key creation 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { GetRoleDefinitionsRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // string | Filter to only return relations that accept this subject type (e.g., \"ApiKey\", \"User\") (optional)
    subject: ApiKey,
  } satisfies GetRoleDefinitionsRequest;

  try {
    const data = await api.getRoleDefinitions(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **subject** | `string` | Filter to only return relations that accept this subject type (e.g., \&quot;ApiKey\&quot;, \&quot;User\&quot;) | [Optional] [Defaults to `undefined`] |

### Return type

[**GetRoleDefinitions200Response**](GetRoleDefinitions200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Namespace definitions retrieved successfully |  -  |
| **401** | Invalid or missing JWT token |  -  |
| **500** | Failed to fetch definitions |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getTenantBillingStatus

> GetTenantBillingStatus200Response getTenantBillingStatus()

Get billing status

Checks whether the tenant has billing information configured in Stripe and if it\&#39;s active.  ## Authentication Requires JWT token with tenant context.  ## Use Cases - Check if billing setup is required - Conditional feature access - Payment method verification 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { GetTenantBillingStatusRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  try {
    const data = await api.getTenantBillingStatus();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**GetTenantBillingStatus200Response**](GetTenantBillingStatus200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Billing status retrieved successfully |  -  |
| **401** | User not authenticated |  -  |
| **404** | Tenant not found |  -  |
| **500** | Failed to check billing status |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getTenantByID

> GetTenantByID200Response getTenantByID(tenantId)

Get tenant by ID

Returns a tenant by its ID.  ## Authentication - **Service Key Auth**: Requires X-Service-Key header (service-to-service only)  ## Use Cases - Service-to-service tenant resolution - Webhook processing - Backend tenant lookup 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { GetTenantByIDRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // string | Tenant ID (UUID)
    tenantId: 7d5da463-8351-4abe-870c-8ccdefc4d78c,
  } satisfies GetTenantByIDRequest;

  try {
    const data = await api.getTenantByID(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **tenantId** | `string` | Tenant ID (UUID) | [Defaults to `undefined`] |

### Return type

[**GetTenantByID200Response**](GetTenantByID200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Tenant found |  -  |
| **400** | Bad request - Invalid tenant_id |  -  |
| **401** | User not authenticated |  -  |
| **404** | Tenant not found |  -  |
| **500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getTenantByStripeCustomerID

> GetTenantByStripeCustomerID200Response getTenantByStripeCustomerID(stripeCustomerId)

Get tenant by Stripe customer ID

Returns a tenant by its Stripe customer ID.  ## Authentication - **Service Key Auth**: Requires X-Service-Key header (service-to-service only)  ## Use Cases - Stripe webhook processing - Payment event correlation - Invoice/subscription tenant resolution 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { GetTenantByStripeCustomerIDRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // string | Stripe customer ID
    stripeCustomerId: cus_TOWEstcga5ou7a,
  } satisfies GetTenantByStripeCustomerIDRequest;

  try {
    const data = await api.getTenantByStripeCustomerID(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **stripeCustomerId** | `string` | Stripe customer ID | [Defaults to `undefined`] |

### Return type

[**GetTenantByStripeCustomerID200Response**](GetTenantByStripeCustomerID200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Tenant found |  -  |
| **400** | Bad request - Invalid stripe_customer_id |  -  |
| **401** | User not authenticated |  -  |
| **404** | Tenant not found |  -  |
| **500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getTenantJWT

> GetTenantJWT200Response getTenantJWT(xUserId, xTenantId)

Get PostgREST JWT token

Generates a JWT token for direct PostgREST database access with the user\&#39;s active tenant context.  ## Authentication - **Session Auth**: Requires JWT token / Cookie Session and active tenant - **Service Key Auth**: Requires X-Service-Key + X-Tenant-ID + X-User-ID headers  ## Use Cases - Client-side database queries - Real-time subscriptions - Direct PostgREST API access 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { GetTenantJWTRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // string | User ID (UUID) - Required when using X-Service-Key header (optional)
    xUserId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)
    xTenantId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetTenantJWTRequest;

  try {
    const data = await api.getTenantJWT(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **xUserId** | `string` | User ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |
| **xTenantId** | `string` | Tenant ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |

### Return type

[**GetTenantJWT200Response**](GetTenantJWT200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | JWT token generated successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | User not authenticated |  -  |
| **403** | Forbidden - Insufficient permissions |  -  |
| **500** | Failed to create JWT token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getTenantSubscription

> GetTenantSubscription200Response getTenantSubscription(configPriceId)

Get tenant subscription by plan

Returns a single subscription for the specified config_price_id (plan ID).  ## Authentication Requires JWT token with tenant context.  ## Use Cases - Check if tenant has a specific subscription - Get subscription details for a specific plan - Retrieve Stripe subscription ID for a plan 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { GetTenantSubscriptionRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // string | The configuration price ID (plan ID) to look up
    configPriceId: neon_compute_starter,
  } satisfies GetTenantSubscriptionRequest;

  try {
    const data = await api.getTenantSubscription(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **configPriceId** | `string` | The configuration price ID (plan ID) to look up | [Defaults to `undefined`] |

### Return type

[**GetTenantSubscription200Response**](GetTenantSubscription200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Subscription found |  -  |
| **400** | Missing config_price_id parameter |  -  |
| **401** | User not authenticated |  -  |
| **404** | Subscription not found for the specified plan |  -  |
| **500** | Failed to fetch subscription |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listRoles

> ListRoles200Response listRoles(xTenantId)

List roles

Returns all roles for the authenticated tenant, including both system roles and custom tenant-specific roles.  ## Authentication - **Session Auth**: Requires JWT token / Cookie Session with tenant context - **Service Key Auth**: Requires X-Service-Key + X-Tenant-ID header  ## Use Cases - Display available roles to assign - Role management UI - Permission auditing 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { ListRolesRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)
    xTenantId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies ListRolesRequest;

  try {
    const data = await api.listRoles(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **xTenantId** | `string` | Tenant ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |

### Return type

[**ListRoles200Response**](ListRoles200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Roles retrieved successfully |  -  |
| **400** | Missing tenant ID |  -  |
| **401** | Invalid or missing JWT token |  -  |
| **500** | Failed to list roles |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listTenantSubscriptions

> ListTenantSubscriptions200Response listTenantSubscriptions()

Get tenant subscriptions

Returns all active Stripe subscriptions associated with the tenant\&#39;s Stripe customer.  ## Authentication Requires JWT token with tenant context.  ## Use Cases - Display current subscriptions - Billing overview - Subscription management UI 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { ListTenantSubscriptionsRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  try {
    const data = await api.listTenantSubscriptions();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**ListTenantSubscriptions200Response**](ListTenantSubscriptions200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Tenant subscriptions retrieved successfully |  -  |
| **401** | User not authenticated |  -  |
| **404** | Tenant not found |  -  |
| **500** | Failed to fetch subscriptions |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listTenantUsers

> ListTenantUsers200Response listTenantUsers(xUserId, xTenantId)

Get tenant users

Returns all users who are members of the tenant with their profile information and roles.  ## Authentication - **Session Auth**: Requires JWT token / Cookie Session with &#x60;view_users&#x60; permission - **Service Key Auth**: Requires X-Service-Key + X-Tenant-ID + X-User-ID headers with &#x60;view_users&#x60; permission  ## Use Cases - Display team members list - User management UI - Member directory 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { ListTenantUsersRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // string | User ID (UUID) - Required when using X-Service-Key header (optional)
    xUserId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)
    xTenantId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies ListTenantUsersRequest;

  try {
    const data = await api.listTenantUsers(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **xUserId** | `string` | User ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |
| **xTenantId** | `string` | Tenant ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |

### Return type

[**ListTenantUsers200Response**](ListTenantUsers200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Tenant users retrieved successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | User not authenticated |  -  |
| **403** | Insufficient permissions - must have view_users permission |  -  |
| **500** | Failed to fetch tenant users |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeSubscription

> RemoveSubscription200Response removeSubscription(removeSubscriptionRequest)

Remove subscription

Cancels a Stripe subscription immediately for the authenticated tenant based on the plan ID.  ## Authentication Requires JWT token with tenant context.  ## Request Parameters - **plan_id** (required): The configuration item ID (e.g., \&quot;neon_compute_starter\&quot;) to identify which subscription to cancel - **stripe_customer_id** (optional): Override tenant\&#39;s Stripe customer ID if needed  ## Process Flow 1. Validates the plan_id and maps it to a Stripe price_id via the stripe_id_mappings table 2. Resolves the Stripe customer ID from the authenticated tenant (or uses provided stripe_customer_id) 3. Finds the active subscription matching the price_id for the customer 4. Cancels the subscription immediately in Stripe 5. Returns the cancellation confirmation  ## Notes - The subscription is canceled immediately, not at the end of the billing period - If no matching subscription is found, returns a 404 error - Only active, trialing, or past_due subscriptions can be canceled  ## Use Cases - Remove specific service subscriptions from tenant - Downgrade by removing premium features - Stop billing for unused resources 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { RemoveSubscriptionOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // RemoveSubscriptionRequest
    removeSubscriptionRequest: ...,
  } satisfies RemoveSubscriptionOperationRequest;

  try {
    const data = await api.removeSubscription(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **removeSubscriptionRequest** | [RemoveSubscriptionRequest](RemoveSubscriptionRequest.md) |  | |

### Return type

[**RemoveSubscription200Response**](RemoveSubscription200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Subscription canceled successfully |  -  |
| **400** | Bad request - Invalid or missing required headers/body |  -  |
| **401** | User not authenticated |  -  |
| **404** | No matching subscription found for the plan |  -  |
| **500** | Failed to cancel subscription or map plan_id |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeTenantUser

> SuccessResponse removeTenantUser(deleteTenantUserRequest)

Remove tenant user

Removes a user from the tenant and cleans up all associated permissions and Keto relationships.  ## Authentication Requires JWT token with &#x60;remove_user&#x60; permission.  ## Restrictions - Cannot remove the last owner (must have at least one owner) - Removing an owner requires &#x60;remove_owner_role&#x60; permission  ## Process 1. Verifies permissions 2. Removes from role\&#39;s user list 3. Deletes all Keto relationships 4. Removes from database 5. Cleans up user\&#39;s tenant state 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { RemoveTenantUserRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // DeleteTenantUserRequest
    deleteTenantUserRequest: ...,
  } satisfies RemoveTenantUserRequest;

  try {
    const data = await api.removeTenantUser(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **deleteTenantUserRequest** | [DeleteTenantUserRequest](DeleteTenantUserRequest.md) |  | |

### Return type

[**SuccessResponse**](SuccessResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | User removed successfully |  -  |
| **400** | Bad request - Invalid or missing required headers/body |  -  |
| **401** | User not authenticated |  -  |
| **403** | Insufficient permissions |  -  |
| **404** | User not found in tenant |  -  |
| **500** | Failed to remove user |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## switchActiveTenant

> SwitchActiveTenant200Response switchActiveTenant(switchTenantRequest, xUserId)

Switch active tenant

Updates the user\&#39;s active tenant in Kratos identity and returns a new JWT token with updated tenant context.  ## Authentication - **Session Auth**: Requires JWT token / Cookie Session - **Service Key Auth**: Requires X-Service-Key + X-User-ID header  ## Use Cases - Switch between organizations - Change context for multi-tenant users 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { SwitchActiveTenantRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // SwitchTenantRequest
    switchTenantRequest: ...,
    // string | User ID (UUID) - Required when using X-Service-Key header (optional)
    xUserId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies SwitchActiveTenantRequest;

  try {
    const data = await api.switchActiveTenant(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **switchTenantRequest** | [SwitchTenantRequest](SwitchTenantRequest.md) |  | |
| **xUserId** | `string` | User ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |

### Return type

[**SwitchActiveTenant200Response**](SwitchActiveTenant200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successfully switched tenants |  -  |
| **400** | Bad request - Invalid or missing required headers/body |  -  |
| **401** | User not authenticated |  -  |
| **404** | Tenant not found or user doesn\&#39;t have access to it |  -  |
| **500** | Failed to switch tenant |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateRole

> CreateRole200Response updateRole(roleId, updateRoleRequest, xUserId, xTenantId)

Update role

Updates the permissions for an existing role. This will update Keto relationships for all users assigned to this role.  ## Authentication - **Session Auth**: Requires JWT token / Cookie Session with tenant context and appropriate permissions - **Service Key Auth**: Requires X-Service-Key + X-Tenant-ID + X-User-ID headers with appropriate permissions  ## Permission Format Permissions should be in the format: &#x60;namespace:resource#relation&#x60;  ## Use Cases - Modify role permissions - Grant or revoke access - Update role capabilities 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { UpdateRoleOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // string | Role ID
    roleId: roleId_example,
    // UpdateRoleRequest
    updateRoleRequest: ...,
    // string | User ID (UUID) - Required when using X-Service-Key header (optional)
    xUserId: 550e8400-e29b-41d4-a716-446655440000,
    // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)
    xTenantId: 31c60057-bd7c-41b8-b96e-c4ceb845034f,
  } satisfies UpdateRoleOperationRequest;

  try {
    const data = await api.updateRole(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **roleId** | `string` | Role ID | [Defaults to `undefined`] |
| **updateRoleRequest** | [UpdateRoleRequest](UpdateRoleRequest.md) |  | |
| **xUserId** | `string` | User ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |
| **xTenantId** | `string` | Tenant ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |

### Return type

[**CreateRole200Response**](CreateRole200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Role updated successfully |  -  |
| **400** | Bad request - Invalid or missing required headers/body |  -  |
| **401** | Invalid or missing JWT token |  -  |
| **403** | Forbidden - Insufficient permissions |  -  |
| **404** | Role not found |  -  |
| **500** | Failed to update role |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateTenantUserRole

> UpdateTenantUserRole200Response updateTenantUserRole(updateTenantUserRoleRequest, xUserId, xTenantId)

Update user role

Updates a user\&#39;s role in the tenant and updates all associated Keto permissions.  ## Authentication - **Session Auth**: Requires JWT token / Cookie Session with &#x60;update_user_role&#x60; permission - **Service Key Auth**: Requires X-Service-Key + X-Tenant-ID + X-User-ID headers with &#x60;update_user_role&#x60; permission  ## Restrictions - Promoting to owner requires &#x60;update_user_role_to_owner&#x60; permission - Demoting from owner requires &#x60;remove_owner_role&#x60; permission - Cannot demote the last owner (must have at least one owner)  ## Process 1. Verifies permissions 2. Removes old role permissions 3. Updates database 4. Assigns new role permissions 

### Example

```ts
import {
  Configuration,
  V1TenantsApi,
} from '@omnibase/core-js';
import type { UpdateTenantUserRoleOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsApi(config);

  const body = {
    // UpdateTenantUserRoleRequest
    updateTenantUserRoleRequest: ...,
    // string | User ID (UUID) - Required when using X-Service-Key header (optional)
    xUserId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)
    xTenantId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies UpdateTenantUserRoleOperationRequest;

  try {
    const data = await api.updateTenantUserRole(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **updateTenantUserRoleRequest** | [UpdateTenantUserRoleRequest](UpdateTenantUserRoleRequest.md) |  | |
| **xUserId** | `string` | User ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |
| **xTenantId** | `string` | Tenant ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |

### Return type

[**UpdateTenantUserRole200Response**](UpdateTenantUserRole200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | User role updated successfully |  -  |
| **400** | Bad request - Invalid or missing required headers/body |  -  |
| **401** | User not authenticated |  -  |
| **403** | Insufficient permissions |  -  |
| **404** | User not found in tenant |  -  |
| **500** | Failed to update role |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

