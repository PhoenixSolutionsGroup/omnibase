# V1StorageApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**deleteObject**](V1StorageApi.md#deleteobjectoperation) | **DELETE** /api/v1/storage/object | Delete file from storage |
| [**downloadFile**](V1StorageApi.md#downloadfile) | **POST** /api/v1/storage/download | Download file from storage |
| [**uploadFile**](V1StorageApi.md#uploadfile) | **POST** /api/v1/storage/upload | Upload file to storage |



## deleteObject

> DeleteObject200Response deleteObject(deleteObjectRequest, xUserId, xTenantId, xPostgrestToken, omnibasePostgrestJwt)

Delete file from storage

Deletes a file from S3 storage with Row-Level Security (RLS) enforcement.  ## Authentication - **Session Auth**: Requires JWT token via Cookie (&#x60;omnibase_postgrest_jwt&#x60;) or Header (&#x60;X-Postgrest-Token&#x60;) - **Service Key Auth**: Requires X-Service-Key + X-User-Id + X-Tenant-Id + X-Postgrest-Token headers  ## RLS Policy Delete permission is checked via PostgREST against the &#x60;storage.objects&#x60; table. Users must have DELETE permission based on their custom RLS policies.  ## Deletion Process 1. Metadata is deleted from database (with RLS check) 2. File is deleted from S3 storage 3. If S3 deletion fails, metadata is already removed (eventual consistency) 

### Example

```ts
import {
  Configuration,
  V1StorageApi,
} from '@omnibase/core-js';
import type { DeleteObjectOperationRequest } from '@omnibase/core-js';

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
  const api = new V1StorageApi(config);

  const body = {
    // DeleteObjectRequest
    deleteObjectRequest: ...,
    // string | User ID (UUID) - Required when using X-Service-Key header (optional)
    xUserId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)
    xTenantId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | PostgREST JWT token - Alternative to cookie authentication (optional)
    xPostgrestToken: xPostgrestToken_example,
    // string | PostgREST JWT token in cookie form (optional)
    omnibasePostgrestJwt: omnibasePostgrestJwt_example,
  } satisfies DeleteObjectOperationRequest;

  try {
    const data = await api.deleteObject(body);
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
| **deleteObjectRequest** | [DeleteObjectRequest](DeleteObjectRequest.md) |  | |
| **xUserId** | `string` | User ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |
| **xTenantId** | `string` | Tenant ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |
| **xPostgrestToken** | `string` | PostgREST JWT token - Alternative to cookie authentication | [Optional] [Defaults to `undefined`] |
| **omnibasePostgrestJwt** | `string` | PostgREST JWT token in cookie form | [Optional] [Defaults to `undefined`] |

### Return type

[**DeleteObject200Response**](DeleteObject200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | File deleted successfully |  -  |
| **400** | Bad request - Invalid or missing required headers/body |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **403** | Forbidden - Insufficient permissions |  -  |
| **404** | Not Found - Resource not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## downloadFile

> DownloadFile200Response downloadFile(downloadRequest, xUserId, xTenantId, xPostgrestToken, omnibasePostgrestJwt)

Download file from storage

Generates a presigned S3 download URL with Row-Level Security (RLS) enforcement.  ## Authentication - **Session Auth**: Requires JWT token via Cookie (&#x60;omnibase_postgrest_jwt&#x60;) or Header (&#x60;X-Postgrest-Token&#x60;) - **Service Key Auth**: Requires X-Service-Key + X-User-Id + X-Tenant-Id + X-Postgrest-Token headers  ## RLS Policy Download permission is checked via PostgREST against the &#x60;storage.objects&#x60; table. Users must have SELECT permission based on their custom RLS policies.  ## Download Process 1. Request presigned URL from this endpoint 2. Download file directly from S3 using returned URL (GET request)  ## URL Expiration Presigned URLs are valid for 15 minutes after generation. 

### Example

```ts
import {
  Configuration,
  V1StorageApi,
} from '@omnibase/core-js';
import type { DownloadFileRequest } from '@omnibase/core-js';

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
  const api = new V1StorageApi(config);

  const body = {
    // DownloadRequest
    downloadRequest: ...,
    // string | User ID (UUID) - Required when using X-Service-Key header (optional)
    xUserId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)
    xTenantId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | PostgREST JWT token - Alternative to cookie authentication (optional)
    xPostgrestToken: xPostgrestToken_example,
    // string | PostgREST JWT token in cookie form (optional)
    omnibasePostgrestJwt: omnibasePostgrestJwt_example,
  } satisfies DownloadFileRequest;

  try {
    const data = await api.downloadFile(body);
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
| **downloadRequest** | [DownloadRequest](DownloadRequest.md) |  | |
| **xUserId** | `string` | User ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |
| **xTenantId** | `string` | Tenant ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |
| **xPostgrestToken** | `string` | PostgREST JWT token - Alternative to cookie authentication | [Optional] [Defaults to `undefined`] |
| **omnibasePostgrestJwt** | `string` | PostgREST JWT token in cookie form | [Optional] [Defaults to `undefined`] |

### Return type

[**DownloadFile200Response**](DownloadFile200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Download URL generated successfully |  -  |
| **400** | Bad request - Invalid or missing required headers/body |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **403** | Forbidden - Insufficient permissions |  -  |
| **404** | Not Found - Resource not found |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## uploadFile

> UploadFile200Response uploadFile(uploadRequest, xUserId, xTenantId, xPostgrestToken, omnibasePostgrestJwt)

Upload file to storage

Generates a presigned S3 upload URL with Row-Level Security (RLS) enforcement.  ## Authentication - **Session Auth**: Requires JWT token via Cookie (&#x60;omnibase_postgrest_jwt&#x60;) or Header (&#x60;X-Postgrest-Token&#x60;) - **Service Key Auth**: Requires X-Service-Key + X-User-Id + X-Tenant-Id + X-Postgrest-Token headers  ## RLS Policy Upload permission is checked via PostgREST against the &#x60;storage.objects&#x60; table. Users must have INSERT permission based on their custom RLS policies.  ## Upload Process 1. Request presigned URL from this endpoint 2. Upload file directly to S3 using returned URL (PUT request) 3. File metadata is automatically stored in database  ## URL Expiration Presigned URLs are valid for 15 minutes after generation. 

### Example

```ts
import {
  Configuration,
  V1StorageApi,
} from '@omnibase/core-js';
import type { UploadFileRequest } from '@omnibase/core-js';

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
  const api = new V1StorageApi(config);

  const body = {
    // UploadRequest
    uploadRequest: ...,
    // string | User ID (UUID) - Required when using X-Service-Key header (optional)
    xUserId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)
    xTenantId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | PostgREST JWT token - Alternative to cookie authentication (optional)
    xPostgrestToken: xPostgrestToken_example,
    // string | PostgREST JWT token in cookie form (optional)
    omnibasePostgrestJwt: omnibasePostgrestJwt_example,
  } satisfies UploadFileRequest;

  try {
    const data = await api.uploadFile(body);
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
| **uploadRequest** | [UploadRequest](UploadRequest.md) |  | |
| **xUserId** | `string` | User ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |
| **xTenantId** | `string` | Tenant ID (UUID) - Required when using X-Service-Key header | [Optional] [Defaults to `undefined`] |
| **xPostgrestToken** | `string` | PostgREST JWT token - Alternative to cookie authentication | [Optional] [Defaults to `undefined`] |
| **omnibasePostgrestJwt** | `string` | PostgREST JWT token in cookie form | [Optional] [Defaults to `undefined`] |

### Return type

[**UploadFile200Response**](UploadFile200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Upload URL generated successfully |  -  |
| **400** | Bad request - Invalid or missing required headers/body |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **403** | Forbidden - Insufficient permissions |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

