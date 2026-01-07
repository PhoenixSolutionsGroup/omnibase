# \V1StorageAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**DeleteObject**](V1StorageAPI.md#DeleteObject) | **Delete** /api/v1/storage/object | Delete file from storage
[**DownloadFile**](V1StorageAPI.md#DownloadFile) | **Post** /api/v1/storage/download | Download file from storage
[**UploadFile**](V1StorageAPI.md#UploadFile) | **Post** /api/v1/storage/upload | Upload file to storage



## DeleteObject

> DeleteObject200Response DeleteObject(ctx).DeleteObjectRequest(deleteObjectRequest).XUserId(xUserId).XTenantId(xTenantId).XPostgrestToken(xPostgrestToken).OmnibasePostgrestJwt(omnibasePostgrestJwt).Execute()

Delete file from storage



### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/PhoenixSolutionsGroup/omnibase/sdk/core/go"
)

func main() {
	deleteObjectRequest := *openapiclient.NewDeleteObjectRequest("avatars/user-123.png") // DeleteObjectRequest | 
	xUserId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | User ID (UUID) - Required when using X-Service-Key header (optional)
	xTenantId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)
	xPostgrestToken := "xPostgrestToken_example" // string | PostgREST JWT token - Alternative to cookie authentication (optional)
	omnibasePostgrestJwt := "omnibasePostgrestJwt_example" // string | PostgREST JWT token in cookie form (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StorageAPI.DeleteObject(context.Background()).DeleteObjectRequest(deleteObjectRequest).XUserId(xUserId).XTenantId(xTenantId).XPostgrestToken(xPostgrestToken).OmnibasePostgrestJwt(omnibasePostgrestJwt).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StorageAPI.DeleteObject``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `DeleteObject`: DeleteObject200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StorageAPI.DeleteObject`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiDeleteObjectRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **deleteObjectRequest** | [**DeleteObjectRequest**](DeleteObjectRequest.md) |  | 
 **xUserId** | **string** | User ID (UUID) - Required when using X-Service-Key header | 
 **xTenantId** | **string** | Tenant ID (UUID) - Required when using X-Service-Key header | 
 **xPostgrestToken** | **string** | PostgREST JWT token - Alternative to cookie authentication | 
 **omnibasePostgrestJwt** | **string** | PostgREST JWT token in cookie form | 

### Return type

[**DeleteObject200Response**](DeleteObject200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DownloadFile

> DownloadFile200Response DownloadFile(ctx).DownloadRequest(downloadRequest).XUserId(xUserId).XTenantId(xTenantId).XPostgrestToken(xPostgrestToken).OmnibasePostgrestJwt(omnibasePostgrestJwt).Execute()

Download file from storage



### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/PhoenixSolutionsGroup/omnibase/sdk/core/go"
)

func main() {
	downloadRequest := *openapiclient.NewDownloadRequest("avatars/user-123.png") // DownloadRequest | 
	xUserId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | User ID (UUID) - Required when using X-Service-Key header (optional)
	xTenantId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)
	xPostgrestToken := "xPostgrestToken_example" // string | PostgREST JWT token - Alternative to cookie authentication (optional)
	omnibasePostgrestJwt := "omnibasePostgrestJwt_example" // string | PostgREST JWT token in cookie form (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StorageAPI.DownloadFile(context.Background()).DownloadRequest(downloadRequest).XUserId(xUserId).XTenantId(xTenantId).XPostgrestToken(xPostgrestToken).OmnibasePostgrestJwt(omnibasePostgrestJwt).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StorageAPI.DownloadFile``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `DownloadFile`: DownloadFile200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StorageAPI.DownloadFile`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiDownloadFileRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **downloadRequest** | [**DownloadRequest**](DownloadRequest.md) |  | 
 **xUserId** | **string** | User ID (UUID) - Required when using X-Service-Key header | 
 **xTenantId** | **string** | Tenant ID (UUID) - Required when using X-Service-Key header | 
 **xPostgrestToken** | **string** | PostgREST JWT token - Alternative to cookie authentication | 
 **omnibasePostgrestJwt** | **string** | PostgREST JWT token in cookie form | 

### Return type

[**DownloadFile200Response**](DownloadFile200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## UploadFile

> UploadFile200Response UploadFile(ctx).UploadRequest(uploadRequest).XUserId(xUserId).XTenantId(xTenantId).XPostgrestToken(xPostgrestToken).OmnibasePostgrestJwt(omnibasePostgrestJwt).Execute()

Upload file to storage



### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/PhoenixSolutionsGroup/omnibase/sdk/core/go"
)

func main() {
	uploadRequest := *openapiclient.NewUploadRequest("avatars/user-123.png") // UploadRequest | 
	xUserId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | User ID (UUID) - Required when using X-Service-Key header (optional)
	xTenantId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)
	xPostgrestToken := "xPostgrestToken_example" // string | PostgREST JWT token - Alternative to cookie authentication (optional)
	omnibasePostgrestJwt := "omnibasePostgrestJwt_example" // string | PostgREST JWT token in cookie form (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StorageAPI.UploadFile(context.Background()).UploadRequest(uploadRequest).XUserId(xUserId).XTenantId(xTenantId).XPostgrestToken(xPostgrestToken).OmnibasePostgrestJwt(omnibasePostgrestJwt).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StorageAPI.UploadFile``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `UploadFile`: UploadFile200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StorageAPI.UploadFile`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiUploadFileRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **uploadRequest** | [**UploadRequest**](UploadRequest.md) |  | 
 **xUserId** | **string** | User ID (UUID) - Required when using X-Service-Key header | 
 **xTenantId** | **string** | Tenant ID (UUID) - Required when using X-Service-Key header | 
 **xPostgrestToken** | **string** | PostgREST JWT token - Alternative to cookie authentication | 
 **omnibasePostgrestJwt** | **string** | PostgREST JWT token in cookie form | 

### Return type

[**UploadFile200Response**](UploadFile200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

