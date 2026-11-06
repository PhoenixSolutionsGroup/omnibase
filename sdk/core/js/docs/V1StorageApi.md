# V1StorageApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**deleteObject**](V1StorageApi.md#deleteobjectoperation) | **DELETE** /api/v1/storage/object | Delete file from storage |
| [**downloadFile**](V1StorageApi.md#downloadfile) | **POST** /api/v1/storage/download | Download file from storage |
| [**makeFilePublic**](V1StorageApi.md#makefilepublic) | **POST** /api/v1/storage/make-public | Make a file publicly accessible |
| [**uploadFile**](V1StorageApi.md#uploadfile) | **POST** /api/v1/storage/upload | Upload file to storage |



## deleteObject

> DeleteObjectResponse deleteObject(deleteObjectRequest)

Delete file from storage

Storage object paths are unique across the entire bucket, not per tenant. Prefix paths with the tenant ID or another unique namespace, for example &#x60;tenants/&lt;tenant_id&gt;/avatars/me.png&#x60;.

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
    // To configure API key authorization: AppKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1StorageApi(config);

  const body = {
    // DeleteObjectRequest
    deleteObjectRequest: ...,
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

### Return type

[**DeleteObjectResponse**](DeleteObjectResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [AppKeyAuth](../README.md#AppKeyAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **400** | Bad Request |  -  |
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |
| **422** | Unprocessable Entity |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## downloadFile

> DownloadResponse downloadFile(downloadRequest)

Download file from storage

Storage object paths are unique across the entire bucket, not per tenant. Prefix paths with the tenant ID or another unique namespace, for example &#x60;tenants/&lt;tenant_id&gt;/avatars/me.png&#x60;.

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
    // To configure API key authorization: AppKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1StorageApi(config);

  const body = {
    // DownloadRequest
    downloadRequest: ...,
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

### Return type

[**DownloadResponse**](DownloadResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [AppKeyAuth](../README.md#AppKeyAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **400** | Bad Request |  -  |
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |
| **422** | Unprocessable Entity |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## makeFilePublic

> MakePublicResponse makeFilePublic(makePublicRequest)

Make a file publicly accessible

Storage object paths are unique across the entire bucket, not per tenant. Prefix paths with the tenant ID or another unique namespace, for example &#x60;tenants/&lt;tenant_id&gt;/avatars/me.png&#x60;.

### Example

```ts
import {
  Configuration,
  V1StorageApi,
} from '@omnibase/core-js';
import type { MakeFilePublicRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: AppKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1StorageApi(config);

  const body = {
    // MakePublicRequest
    makePublicRequest: ...,
  } satisfies MakeFilePublicRequest;

  try {
    const data = await api.makeFilePublic(body);
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
| **makePublicRequest** | [MakePublicRequest](MakePublicRequest.md) |  | |

### Return type

[**MakePublicResponse**](MakePublicResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [AppKeyAuth](../README.md#AppKeyAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **400** | Bad Request |  -  |
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |
| **422** | Unprocessable Entity |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## uploadFile

> UploadResponse uploadFile(uploadRequest)

Upload file to storage

Storage object paths are unique across the entire bucket, not per tenant. Prefix paths with the tenant ID or another unique namespace, for example &#x60;tenants/&lt;tenant_id&gt;/avatars/me.png&#x60;. Uploading to an existing path returns 409 Conflict.

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
    // To configure API key authorization: AppKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1StorageApi(config);

  const body = {
    // UploadRequest
    uploadRequest: ...,
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

### Return type

[**UploadResponse**](UploadResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [AppKeyAuth](../README.md#AppKeyAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **400** | Bad Request |  -  |
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |
| **409** | Conflict |  -  |
| **422** | Unprocessable Entity |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

