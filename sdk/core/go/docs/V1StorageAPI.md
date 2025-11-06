# \V1StorageAPI

All URIs are relative to *http://https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ApiV1StorageDownloadPost**](V1StorageAPI.md#ApiV1StorageDownloadPost) | **Post** /api/v1/storage/download | Download file from storage
[**ApiV1StorageObjectDelete**](V1StorageAPI.md#ApiV1StorageObjectDelete) | **Delete** /api/v1/storage/object | Delete file from storage
[**ApiV1StorageUploadPost**](V1StorageAPI.md#ApiV1StorageUploadPost) | **Post** /api/v1/storage/upload | Upload file to storage



## ApiV1StorageDownloadPost

> ApiV1StorageDownloadPost200Response ApiV1StorageDownloadPost(ctx).Request(request).Execute()

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
	request := *openapiclient.NewModelsDownloadRequest("public/avatars/user-123.png") // ModelsDownloadRequest | Path of file to download

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StorageAPI.ApiV1StorageDownloadPost(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StorageAPI.ApiV1StorageDownloadPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ApiV1StorageDownloadPost`: ApiV1StorageDownloadPost200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StorageAPI.ApiV1StorageDownloadPost`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiApiV1StorageDownloadPostRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**ModelsDownloadRequest**](ModelsDownloadRequest.md) | Path of file to download | 

### Return type

[**ApiV1StorageDownloadPost200Response**](ApiV1StorageDownloadPost200Response.md)

### Authorization

[SessionAuth](../README.md#SessionAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ApiV1StorageObjectDelete

> ApiV1StorageObjectDelete200Response ApiV1StorageObjectDelete(ctx).Request(request).Execute()

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
	request := *openapiclient.NewModelsDeleteObjectRequest("public/avatars/user-123.png") // ModelsDeleteObjectRequest | Path of file to delete

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StorageAPI.ApiV1StorageObjectDelete(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StorageAPI.ApiV1StorageObjectDelete``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ApiV1StorageObjectDelete`: ApiV1StorageObjectDelete200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StorageAPI.ApiV1StorageObjectDelete`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiApiV1StorageObjectDeleteRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**ModelsDeleteObjectRequest**](ModelsDeleteObjectRequest.md) | Path of file to delete | 

### Return type

[**ApiV1StorageObjectDelete200Response**](ApiV1StorageObjectDelete200Response.md)

### Authorization

[SessionAuth](../README.md#SessionAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ApiV1StorageUploadPost

> ApiV1StorageUploadPost200Response ApiV1StorageUploadPost(ctx).Request(request).Execute()

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
	request := *openapiclient.NewModelsUploadRequest("public/avatars/user-123.png") // ModelsUploadRequest | Upload configuration with path and optional metadata

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StorageAPI.ApiV1StorageUploadPost(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StorageAPI.ApiV1StorageUploadPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ApiV1StorageUploadPost`: ApiV1StorageUploadPost200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StorageAPI.ApiV1StorageUploadPost`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiApiV1StorageUploadPostRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**ModelsUploadRequest**](ModelsUploadRequest.md) | Upload configuration with path and optional metadata | 

### Return type

[**ApiV1StorageUploadPost200Response**](ApiV1StorageUploadPost200Response.md)

### Authorization

[SessionAuth](../README.md#SessionAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

