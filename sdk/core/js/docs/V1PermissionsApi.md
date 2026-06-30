# V1PermissionsApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**checkPermission**](V1PermissionsApi.md#checkpermission) | **POST** /api/v1/permissions/check | Check permission |
| [**createRelationship**](V1PermissionsApi.md#createrelationshipoperation) | **POST** /api/v1/permissions/relationships | Create relationship |
| [**deleteRelationship**](V1PermissionsApi.md#deleterelationshipoperation) | **DELETE** /api/v1/permissions/relationships | Delete relationship |



## checkPermission

> CheckResponse checkPermission(checkRequest)

Check permission

### Example

```ts
import {
  Configuration,
  V1PermissionsApi,
} from '@omnibase/core-js';
import type { CheckPermissionRequest } from '@omnibase/core-js';

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
  const api = new V1PermissionsApi(config);

  const body = {
    // CheckRequest
    checkRequest: ...,
  } satisfies CheckPermissionRequest;

  try {
    const data = await api.checkPermission(body);
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
| **checkRequest** | [CheckRequest](CheckRequest.md) |  | |

### Return type

[**CheckResponse**](CheckResponse.md)

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


## createRelationship

> CreateRelationshipResponse createRelationship(createRelationshipRequest)

Create relationship

### Example

```ts
import {
  Configuration,
  V1PermissionsApi,
} from '@omnibase/core-js';
import type { CreateRelationshipOperationRequest } from '@omnibase/core-js';

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
  const api = new V1PermissionsApi(config);

  const body = {
    // CreateRelationshipRequest
    createRelationshipRequest: ...,
  } satisfies CreateRelationshipOperationRequest;

  try {
    const data = await api.createRelationship(body);
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
| **createRelationshipRequest** | [CreateRelationshipRequest](CreateRelationshipRequest.md) |  | |

### Return type

[**CreateRelationshipResponse**](CreateRelationshipResponse.md)

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


## deleteRelationship

> DeleteRelationshipResponse deleteRelationship(deleteRelationshipRequest)

Delete relationship

### Example

```ts
import {
  Configuration,
  V1PermissionsApi,
} from '@omnibase/core-js';
import type { DeleteRelationshipOperationRequest } from '@omnibase/core-js';

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
  const api = new V1PermissionsApi(config);

  const body = {
    // DeleteRelationshipRequest
    deleteRelationshipRequest: ...,
  } satisfies DeleteRelationshipOperationRequest;

  try {
    const data = await api.deleteRelationship(body);
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
| **deleteRelationshipRequest** | [DeleteRelationshipRequest](DeleteRelationshipRequest.md) |  | |

### Return type

[**DeleteRelationshipResponse**](DeleteRelationshipResponse.md)

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

