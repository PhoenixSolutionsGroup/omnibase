# \StorageAPI

All URIs are relative to *http://https://api.omnibase.tech/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**StorageDownloadPost**](StorageAPI.md#StorageDownloadPost) | **Post** /storage/download | Download file from storage
[**StorageObjectDelete**](StorageAPI.md#StorageObjectDelete) | **Delete** /storage/object | Delete file from storage
[**StorageUploadPost**](StorageAPI.md#StorageUploadPost) | **Post** /storage/upload | Upload file to storage



## StorageDownloadPost

> StorageDownloadPost200Response StorageDownloadPost(ctx).Request(request).Execute()

Download file from storage



### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	request := *openapiclient.NewModelsDownloadRequest("public/avatars/user-123.png") // ModelsDownloadRequest | Path of file to download

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.StorageAPI.StorageDownloadPost(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StorageAPI.StorageDownloadPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `StorageDownloadPost`: StorageDownloadPost200Response
	fmt.Fprintf(os.Stdout, "Response from `StorageAPI.StorageDownloadPost`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiStorageDownloadPostRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**ModelsDownloadRequest**](ModelsDownloadRequest.md) | Path of file to download | 

### Return type

[**StorageDownloadPost200Response**](StorageDownloadPost200Response.md)

### Authorization

[SessionAuth](../README.md#SessionAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## StorageObjectDelete

> StorageObjectDelete200Response StorageObjectDelete(ctx).Request(request).Execute()

Delete file from storage



### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	request := *openapiclient.NewModelsDeleteObjectRequest("public/avatars/user-123.png") // ModelsDeleteObjectRequest | Path of file to delete

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.StorageAPI.StorageObjectDelete(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StorageAPI.StorageObjectDelete``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `StorageObjectDelete`: StorageObjectDelete200Response
	fmt.Fprintf(os.Stdout, "Response from `StorageAPI.StorageObjectDelete`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiStorageObjectDeleteRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**ModelsDeleteObjectRequest**](ModelsDeleteObjectRequest.md) | Path of file to delete | 

### Return type

[**StorageObjectDelete200Response**](StorageObjectDelete200Response.md)

### Authorization

[SessionAuth](../README.md#SessionAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## StorageUploadPost

> StorageUploadPost200Response StorageUploadPost(ctx).Request(request).Execute()

Upload file to storage



### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	request := *openapiclient.NewModelsUploadRequest("public/avatars/user-123.png") // ModelsUploadRequest | Upload configuration with path and optional metadata

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.StorageAPI.StorageUploadPost(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StorageAPI.StorageUploadPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `StorageUploadPost`: StorageUploadPost200Response
	fmt.Fprintf(os.Stdout, "Response from `StorageAPI.StorageUploadPost`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiStorageUploadPostRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**ModelsUploadRequest**](ModelsUploadRequest.md) | Upload configuration with path and optional metadata | 

### Return type

[**StorageUploadPost200Response**](StorageUploadPost200Response.md)

### Authorization

[SessionAuth](../README.md#SessionAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

