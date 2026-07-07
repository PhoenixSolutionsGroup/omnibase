# V1TenantsRolesApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createRole**](V1TenantsRolesApi.md#createroleoperation) | **POST** /api/v1/tenants/roles | Create a role |
| [**deleteRole**](V1TenantsRolesApi.md#deleterole) | **DELETE** /api/v1/tenants/roles/{role_id} | Delete a role |
| [**listRoleDefinitions**](V1TenantsRolesApi.md#listroledefinitions) | **GET** /api/v1/tenants/roles/definitions | List role definitions |
| [**listRoles**](V1TenantsRolesApi.md#listroles) | **GET** /api/v1/tenants/roles | List roles for the tenant |
| [**updateRole**](V1TenantsRolesApi.md#updateroleoperation) | **PUT** /api/v1/tenants/roles/{role_id} | Update a role |



## createRole

> CreateRoleRow createRole(createRoleRequest)

Create a role

### Example

```ts
import {
  Configuration,
  V1TenantsRolesApi,
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
  const api = new V1TenantsRolesApi(config);

  const body = {
    // CreateRoleRequest
    createRoleRequest: ...,
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

### Return type

[**CreateRoleRow**](CreateRoleRow.md)

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


## deleteRole

> any deleteRole(roleId)

Delete a role

### Example

```ts
import {
  Configuration,
  V1TenantsRolesApi,
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
  const api = new V1TenantsRolesApi(config);

  const body = {
    // string
    roleId: roleId_example,
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
| **roleId** | `string` |  | [Defaults to `undefined`] |

### Return type

**any**

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


## listRoleDefinitions

> Array&lt;NamespaceDefinitionResponse&gt; listRoleDefinitions(subject)

List role definitions

### Example

```ts
import {
  Configuration,
  V1TenantsRolesApi,
} from '@omnibase/core-js';
import type { ListRoleDefinitionsRequest } from '@omnibase/core-js';

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
  const api = new V1TenantsRolesApi(config);

  const body = {
    // string (optional)
    subject: subject_example,
  } satisfies ListRoleDefinitionsRequest;

  try {
    const data = await api.listRoleDefinitions(body);
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
| **subject** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;NamespaceDefinitionResponse&gt;**](NamespaceDefinitionResponse.md)

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


## listRoles

> Array&lt;ListRolesByTenantRow&gt; listRoles()

List roles for the tenant

### Example

```ts
import {
  Configuration,
  V1TenantsRolesApi,
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
  const api = new V1TenantsRolesApi(config);

  try {
    const data = await api.listRoles();
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

[**Array&lt;ListRolesByTenantRow&gt;**](ListRolesByTenantRow.md)

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


## updateRole

> UpdateRolePermissionsRow updateRole(roleId, updateRoleRequest)

Update a role

### Example

```ts
import {
  Configuration,
  V1TenantsRolesApi,
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
  const api = new V1TenantsRolesApi(config);

  const body = {
    // string
    roleId: roleId_example,
    // UpdateRoleRequest
    updateRoleRequest: ...,
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
| **roleId** | `string` |  | [Defaults to `undefined`] |
| **updateRoleRequest** | [UpdateRoleRequest](UpdateRoleRequest.md) |  | |

### Return type

[**UpdateRolePermissionsRow**](UpdateRolePermissionsRow.md)

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

