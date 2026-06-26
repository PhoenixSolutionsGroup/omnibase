# V1PermissionsApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**checkPermission**](V1PermissionsApi.md#checkpermissionoperation) | **POST** /api/v1/permissions/check | Check permission |
| [**createRelationship**](V1PermissionsApi.md#createrelationshipoperation) | **POST** /api/v1/permissions/relationships | Create relationship |
| [**deleteRelationship**](V1PermissionsApi.md#deleterelationshipoperation) | **DELETE** /api/v1/permissions/relationships | Delete relationship |



## checkPermission

> CheckPermissionResponse checkPermission(checkPermissionRequest)

Check permission

Checks if a subject has a specific permission on an object using Ory Keto.  ## Authentication Requires session authentication.  ## Request Format Provide a &#x60;subject_set&#x60; to identify the subject. For user permissions, use &#x60;namespace: \&quot;User\&quot;&#x60; and &#x60;object: \&quot;&lt;user_id&gt;\&quot;&#x60;.  ## Use Cases - Verify user permissions before performing actions - Implement fine-grained access control - Check role-based permissions 

### Example

```ts
import {
  Configuration,
  V1PermissionsApi,
} from '@omnibase/core-js';
import type { CheckPermissionOperationRequest } from '@omnibase/core-js';

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
    // CheckPermissionRequest | Permission check request with subject_set
    checkPermissionRequest: {"namespace":"Tenant","object":"tenant_test_123","relation":"can_invite_user","subject_set":{"namespace":"User","object":"550e8400-e29b-41d4-a716-446655440000"}},
  } satisfies CheckPermissionOperationRequest;

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
| **checkPermissionRequest** | [CheckPermissionRequest](CheckPermissionRequest.md) | Permission check request with subject_set | |

### Return type

[**CheckPermissionResponse**](CheckPermissionResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Permission check result |  -  |
| **400** | Invalid request body - namespace, object, relation, and subject_set are required |  -  |
| **401** | Not authenticated |  -  |
| **500** | Failed to check permission |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createRelationship

> CreateRelationship200Response createRelationship(createRelationshipRequest)

Create relationship

Creates a new relationship tuple in Ory Keto.  ## Authentication Requires session authentication.  ## Request Format Provide a &#x60;subject_set&#x60; to identify the subject. For user relationships, use &#x60;namespace: \&quot;User\&quot;&#x60; and &#x60;object: \&quot;&lt;user_id&gt;\&quot;&#x60;.  ## Use Cases - Link resources to tenants - Assign users to projects - Create permission relationships 

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
    // CreateRelationshipRequest | Relationship creation request with subject_set
    createRelationshipRequest: {"namespace":"Tenant","object":"tenant_test_123","relation":"owners","subject_set":{"namespace":"User","object":"550e8400-e29b-41d4-a716-446655440000"}},
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
| **createRelationshipRequest** | [CreateRelationshipRequest](CreateRelationshipRequest.md) | Relationship creation request with subject_set | |

### Return type

[**CreateRelationship200Response**](CreateRelationship200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Relationship created successfully |  -  |
| **400** | Invalid request body - namespace, object, relation, and subject_set are required |  -  |
| **401** | Not authenticated |  -  |
| **404** | Not Found - Resource not found |  -  |
| **500** | Failed to create relationship |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteRelationship

> DeleteRelationship200Response deleteRelationship(deleteRelationshipRequest)

Delete relationship

Deletes a relationship tuple from Ory Keto.  ## Authentication Requires session authentication.  ## Request Format Provide a &#x60;subject_set&#x60; to identify the subject. For user relationships, use &#x60;namespace: \&quot;User\&quot;&#x60; and &#x60;object: \&quot;&lt;user_id&gt;\&quot;&#x60;.  ## Use Cases - Remove resource links from tenants - Revoke user assignments from projects - Delete permission relationships 

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
    // DeleteRelationshipRequest | Relationship deletion request with subject_set
    deleteRelationshipRequest: {"namespace":"Tenant","object":"tenant_test_123","relation":"owners","subject_set":{"namespace":"User","object":"550e8400-e29b-41d4-a716-446655440000"}},
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
| **deleteRelationshipRequest** | [DeleteRelationshipRequest](DeleteRelationshipRequest.md) | Relationship deletion request with subject_set | |

### Return type

[**DeleteRelationship200Response**](DeleteRelationship200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Relationship deleted successfully |  -  |
| **400** | Invalid request body - namespace, object, relation, and subject_set are required |  -  |
| **401** | Not authenticated |  -  |
| **404** | Not Found - Resource not found |  -  |
| **500** | Failed to delete relationship |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

