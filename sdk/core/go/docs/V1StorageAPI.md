# \V1StorageAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**DeleteObject**](V1StorageAPI.md#DeleteObject) | **Delete** /api/v1/storage/object | Delete file from storage
[**DownloadFile**](V1StorageAPI.md#DownloadFile) | **Post** /api/v1/storage/download | Download file from storage
[**MakeFilePublic**](V1StorageAPI.md#MakeFilePublic) | **Post** /api/v1/storage/make-public | Make a file publicly accessible
[**UploadFile**](V1StorageAPI.md#UploadFile) | **Post** /api/v1/storage/upload | Upload file to storage



## DeleteObject

> DeleteObjectResponse DeleteObject(ctx).DeleteObjectRequest(deleteObjectRequest).Execute()

Delete file from storage

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"
)

func main() {
	deleteObjectRequest := *openapiclient.NewDeleteObjectRequest("Path_example") // DeleteObjectRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StorageAPI.DeleteObject(context.Background()).DeleteObjectRequest(deleteObjectRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StorageAPI.DeleteObject``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `DeleteObject`: DeleteObjectResponse
	fmt.Fprintf(os.Stdout, "Response from `V1StorageAPI.DeleteObject`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiDeleteObjectRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **deleteObjectRequest** | [**DeleteObjectRequest**](DeleteObjectRequest.md) |  | 

### Return type

[**DeleteObjectResponse**](DeleteObjectResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DownloadFile

> DownloadResponse DownloadFile(ctx).DownloadRequest(downloadRequest).Execute()

Download file from storage

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"
)

func main() {
	downloadRequest := *openapiclient.NewDownloadRequest("Path_example") // DownloadRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StorageAPI.DownloadFile(context.Background()).DownloadRequest(downloadRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StorageAPI.DownloadFile``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `DownloadFile`: DownloadResponse
	fmt.Fprintf(os.Stdout, "Response from `V1StorageAPI.DownloadFile`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiDownloadFileRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **downloadRequest** | [**DownloadRequest**](DownloadRequest.md) |  | 

### Return type

[**DownloadResponse**](DownloadResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## MakeFilePublic

> MakePublicResponse MakeFilePublic(ctx).MakePublicRequest(makePublicRequest).Execute()

Make a file publicly accessible

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"
)

func main() {
	makePublicRequest := *openapiclient.NewMakePublicRequest("Path_example") // MakePublicRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StorageAPI.MakeFilePublic(context.Background()).MakePublicRequest(makePublicRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StorageAPI.MakeFilePublic``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `MakeFilePublic`: MakePublicResponse
	fmt.Fprintf(os.Stdout, "Response from `V1StorageAPI.MakeFilePublic`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiMakeFilePublicRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **makePublicRequest** | [**MakePublicRequest**](MakePublicRequest.md) |  | 

### Return type

[**MakePublicResponse**](MakePublicResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## UploadFile

> UploadResponse UploadFile(ctx).UploadRequest(uploadRequest).Execute()

Upload file to storage

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"
)

func main() {
	uploadRequest := *openapiclient.NewUploadRequest("Path_example") // UploadRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StorageAPI.UploadFile(context.Background()).UploadRequest(uploadRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StorageAPI.UploadFile``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `UploadFile`: UploadResponse
	fmt.Fprintf(os.Stdout, "Response from `V1StorageAPI.UploadFile`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiUploadFileRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **uploadRequest** | [**UploadRequest**](UploadRequest.md) |  | 

### Return type

[**UploadResponse**](UploadResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

