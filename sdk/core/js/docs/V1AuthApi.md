# V1AuthApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createUser**](V1AuthApi.md#createuseroperation) | **POST** /api/v1/auth/users | Create new user |
| [**getActiveTenant**](V1AuthApi.md#getactivetenant) | **GET** /api/v1/auth/active-tenant | Get active tenant |
| [**getIdentity**](V1AuthApi.md#getidentity) | **GET** /api/v1/auth/identity | Get current identity |
| [**getSession**](V1AuthApi.md#getsession) | **GET** /api/v1/auth/session | Get current session |
| [**listTenants**](V1AuthApi.md#listtenants) | **GET** /api/v1/auth/tenants | List user\&#39;s tenants |
| [**logout**](V1AuthApi.md#logout) | **POST** /api/v1/auth/logout | Logout user |
| [**whoAmI**](V1AuthApi.md#whoami) | **GET** /api/v1/auth/whoami | Check authentication status |



## createUser

> CreateUser200Response createUser(createUserRequest)

Create new user

Creates a new user identity via Kratos admin API with email/password credentials.  ## User Creation - Creates Kratos identity with provided traits (email, name) - Sets up password authentication credentials - Returns the created identity information  ## Use Case Administrative user creation endpoint for onboarding flows or user management.  ## Authentication This is an admin endpoint that requires service key authentication. 

### Example

```ts
import {
  Configuration,
  V1AuthApi,
} from '@omnibase/core-js';
import type { CreateUserOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1AuthApi(config);

  const body = {
    // CreateUserRequest
    createUserRequest: ...,
  } satisfies CreateUserOperationRequest;

  try {
    const data = await api.createUser(body);
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
| **createUserRequest** | [CreateUserRequest](CreateUserRequest.md) |  | |

### Return type

[**CreateUser200Response**](CreateUser200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | User created successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **409** | Conflict - Resource already exists or conflicts with current state |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getActiveTenant

> GetActiveTenant200Response getActiveTenant()

Get active tenant

Returns the full tenant object for the user\&#39;s currently active tenant.  ## Tenant Context Users can be members of multiple tenants but only one is active at a time. The active tenant determines which resources and data the user can access.  ## Use Case Determine which tenant context to use for API calls and data filtering. 

### Example

```ts
import {
  Configuration,
  V1AuthApi,
} from '@omnibase/core-js';
import type { GetActiveTenantRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1AuthApi(config);

  try {
    const data = await api.getActiveTenant();
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

[**GetActiveTenant200Response**](GetActiveTenant200Response.md)

### Authorization

[CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Active tenant retrieved |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIdentity

> GetIdentity200Response getIdentity()

Get current identity

Returns the current authenticated user\&#39;s identity information (traits like email, name).  ## Identity Data - User ID (unique identifier) - Traits (email, first name, last name based on identity schema) - Schema ID - Created/updated timestamps  ## Use Case Lighter alternative to full session when you only need user profile data. 

### Example

```ts
import {
  Configuration,
  V1AuthApi,
} from '@omnibase/core-js';
import type { GetIdentityRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1AuthApi(config);

  try {
    const data = await api.getIdentity();
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

[**GetIdentity200Response**](GetIdentity200Response.md)

### Authorization

[CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Identity retrieved successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getSession

> GetSession200Response getSession()

Get current session

Returns the current authenticated user\&#39;s session including identity and tenant information.  ## Session Data - Session metadata (ID, expiry, authentication methods) - Identity information (user ID, traits like email, name) - Active tenant context (if user has tenant membership)  ## Authentication Requires valid session via Cookie or X-Session-Token header. 

### Example

```ts
import {
  Configuration,
  V1AuthApi,
} from '@omnibase/core-js';
import type { GetSessionRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1AuthApi(config);

  try {
    const data = await api.getSession();
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

[**GetSession200Response**](GetSession200Response.md)

### Authorization

[CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Session retrieved successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listTenants

> ListTenants200Response listTenants()

List user\&#39;s tenants

Returns all tenants the user is a member of with their active status.  ## Tenant Memberships Users can be members of multiple tenants. Each membership has: - Active status (only one tenant can be active at a time) - Full tenant information (ID, name, type, etc.)  ## Use Case Display tenant switcher UI or list all organizations the user belongs to. 

### Example

```ts
import {
  Configuration,
  V1AuthApi,
} from '@omnibase/core-js';
import type { ListTenantsRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1AuthApi(config);

  try {
    const data = await api.listTenants();
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

[**ListTenants200Response**](ListTenants200Response.md)

### Authorization

[CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Tenants retrieved successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## logout

> Logout200Response logout()

Logout user

Creates a Kratos logout flow and returns the logout URL for browser redirect.  ## Logout Process 1. Request this endpoint to get logout URL 2. Redirect browser to the returned logout_url 3. Session will be invalidated and user logged out  ## Cookie Cleanup The logout URL handles clearing session cookies automatically. 

### Example

```ts
import {
  Configuration,
  V1AuthApi,
} from '@omnibase/core-js';
import type { LogoutRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1AuthApi(config);

  try {
    const data = await api.logout();
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

[**Logout200Response**](Logout200Response.md)

### Authorization

[CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Logout flow created successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## whoAmI

> WhoAmI200Response whoAmI()

Check authentication status

Lightweight endpoint to check if the user is authenticated.  ## Response Returns boolean authentication status and user ID if authenticated.  ## Use Case Quick auth checks for route guards without fetching full session data. 

### Example

```ts
import {
  Configuration,
  V1AuthApi,
} from '@omnibase/core-js';
import type { WhoAmIRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1AuthApi(config);

  try {
    const data = await api.whoAmI();
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

[**WhoAmI200Response**](WhoAmI200Response.md)

### Authorization

[CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Authentication status checked |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

