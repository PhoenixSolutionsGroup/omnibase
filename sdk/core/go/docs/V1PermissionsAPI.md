# \V1PermissionsAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CheckPermission**](V1PermissionsAPI.md#CheckPermission) | **Post** /api/v1/permissions/check | Check permission
[**CreateRelationship**](V1PermissionsAPI.md#CreateRelationship) | **Post** /api/v1/permissions/relationships | Create relationship
[**DeleteRelationship**](V1PermissionsAPI.md#DeleteRelationship) | **Delete** /api/v1/permissions/relationships | Delete relationship



## CheckPermission

> CheckResponse CheckPermission(ctx).CheckRequest(checkRequest).Execute()

Check permission

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
	checkRequest := *openapiclient.NewCheckRequest("Namespace_example", "Object_example", "Relation_example", *openapiclient.NewSubjectSetRequest("Namespace_example", "Object_example")) // CheckRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PermissionsAPI.CheckPermission(context.Background()).CheckRequest(checkRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PermissionsAPI.CheckPermission``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CheckPermission`: CheckResponse
	fmt.Fprintf(os.Stdout, "Response from `V1PermissionsAPI.CheckPermission`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCheckPermissionRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **checkRequest** | [**CheckRequest**](CheckRequest.md) |  | 

### Return type

[**CheckResponse**](CheckResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateRelationship

> CreateRelationshipResponse CreateRelationship(ctx).CreateRelationshipRequest(createRelationshipRequest).Execute()

Create relationship

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
	createRelationshipRequest := *openapiclient.NewCreateRelationshipRequest("Namespace_example", "Object_example", "Relation_example", *openapiclient.NewSubjectSetRequest("Namespace_example", "Object_example")) // CreateRelationshipRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PermissionsAPI.CreateRelationship(context.Background()).CreateRelationshipRequest(createRelationshipRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PermissionsAPI.CreateRelationship``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateRelationship`: CreateRelationshipResponse
	fmt.Fprintf(os.Stdout, "Response from `V1PermissionsAPI.CreateRelationship`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateRelationshipRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createRelationshipRequest** | [**CreateRelationshipRequest**](CreateRelationshipRequest.md) |  | 

### Return type

[**CreateRelationshipResponse**](CreateRelationshipResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DeleteRelationship

> DeleteRelationshipResponse DeleteRelationship(ctx).DeleteRelationshipRequest(deleteRelationshipRequest).Execute()

Delete relationship

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
	deleteRelationshipRequest := *openapiclient.NewDeleteRelationshipRequest("Namespace_example", "Object_example", "Relation_example", *openapiclient.NewSubjectSetRequest("Namespace_example", "Object_example")) // DeleteRelationshipRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PermissionsAPI.DeleteRelationship(context.Background()).DeleteRelationshipRequest(deleteRelationshipRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PermissionsAPI.DeleteRelationship``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `DeleteRelationship`: DeleteRelationshipResponse
	fmt.Fprintf(os.Stdout, "Response from `V1PermissionsAPI.DeleteRelationship`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiDeleteRelationshipRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **deleteRelationshipRequest** | [**DeleteRelationshipRequest**](DeleteRelationshipRequest.md) |  | 

### Return type

[**DeleteRelationshipResponse**](DeleteRelationshipResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

