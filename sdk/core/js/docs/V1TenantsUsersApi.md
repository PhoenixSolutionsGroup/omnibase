# V1TenantsUsersApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**listTenantUsers**](V1TenantsUsersApi.md#listtenantusers) | **GET** /api/v1/tenants/users | List users in the tenant |
| [**removeTenantUser**](V1TenantsUsersApi.md#removetenantuser) | **DELETE** /api/v1/tenants/users | Remove a user from the tenant |
| [**updateTenantUserRole**](V1TenantsUsersApi.md#updatetenantuserrole) | **PUT** /api/v1/tenants/users | Update a tenant user\&#39;s role |



## listTenantUsers

> Array&lt;UserResponse&gt; listTenantUsers()

List users in the tenant

### Example

```ts
import {
  Configuration,
  V1TenantsUsersApi,
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
  const api = new V1TenantsUsersApi(config);

  try {
    const data = await api.listTenantUsers();
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

[**Array&lt;UserResponse&gt;**](UserResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeTenantUser

> any removeTenantUser(deleteRequest)

Remove a user from the tenant

### Example

```ts
import {
  Configuration,
  V1TenantsUsersApi,
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
  const api = new V1TenantsUsersApi(config);

  const body = {
    // DeleteRequest
    deleteRequest: ...,
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
| **deleteRequest** | [DeleteRequest](DeleteRequest.md) |  | |

### Return type

**any**

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateTenantUserRole

> UpdateUserRoleResponse updateTenantUserRole(updateUserRoleRequest)

Update a tenant user\&#39;s role

### Example

```ts
import {
  Configuration,
  V1TenantsUsersApi,
} from '@omnibase/core-js';
import type { UpdateTenantUserRoleRequest } from '@omnibase/core-js';

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
  const api = new V1TenantsUsersApi(config);

  const body = {
    // UpdateUserRoleRequest
    updateUserRoleRequest: ...,
  } satisfies UpdateTenantUserRoleRequest;

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
| **updateUserRoleRequest** | [UpdateUserRoleRequest](UpdateUserRoleRequest.md) |  | |

### Return type

[**UpdateUserRoleResponse**](UpdateUserRoleResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

