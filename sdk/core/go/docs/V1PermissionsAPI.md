# \V1PermissionsAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CheckPermission**](V1PermissionsAPI.md#CheckPermission) | **Post** /api/v1/permissions/check | Check permission
[**CreateRelationship**](V1PermissionsAPI.md#CreateRelationship) | **Post** /api/v1/permissions/relationships | Create relationship
[**DeleteRelationship**](V1PermissionsAPI.md#DeleteRelationship) | **Delete** /api/v1/permissions/relationships | Delete relationship



## CheckPermission

> CheckPermissionResponse CheckPermission(ctx).CheckPermissionRequest(checkPermissionRequest).Execute()

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
	checkPermissionRequest := *openapiclient.NewCheckPermissionRequest("Tenant", "tenant_test_123", "can_invite_user", *openapiclient.NewSubjectSetRequest("User", "550e8400-e29b-41d4-a716-446655440000")) // CheckPermissionRequest | Permission check request with subject_set

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PermissionsAPI.CheckPermission(context.Background()).CheckPermissionRequest(checkPermissionRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PermissionsAPI.CheckPermission``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CheckPermission`: CheckPermissionResponse
	fmt.Fprintf(os.Stdout, "Response from `V1PermissionsAPI.CheckPermission`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCheckPermissionRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **checkPermissionRequest** | [**CheckPermissionRequest**](CheckPermissionRequest.md) | Permission check request with subject_set | 

### Return type

[**CheckPermissionResponse**](CheckPermissionResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateRelationship

> CreateRelationship200Response CreateRelationship(ctx).CreateRelationshipRequest(createRelationshipRequest).Execute()

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
	createRelationshipRequest := *openapiclient.NewCreateRelationshipRequest("Tenant", "tenant_test_123", "owners", *openapiclient.NewSubjectSetRequest("User", "550e8400-e29b-41d4-a716-446655440000")) // CreateRelationshipRequest | Relationship creation request with subject_set

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PermissionsAPI.CreateRelationship(context.Background()).CreateRelationshipRequest(createRelationshipRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PermissionsAPI.CreateRelationship``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateRelationship`: CreateRelationship200Response
	fmt.Fprintf(os.Stdout, "Response from `V1PermissionsAPI.CreateRelationship`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateRelationshipRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createRelationshipRequest** | [**CreateRelationshipRequest**](CreateRelationshipRequest.md) | Relationship creation request with subject_set | 

### Return type

[**CreateRelationship200Response**](CreateRelationship200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DeleteRelationship

> DeleteRelationship200Response DeleteRelationship(ctx).DeleteRelationshipRequest(deleteRelationshipRequest).Execute()

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
	deleteRelationshipRequest := *openapiclient.NewDeleteRelationshipRequest("Project", "project_123", "tenant", *openapiclient.NewSubjectSetRequest("User", "550e8400-e29b-41d4-a716-446655440000")) // DeleteRelationshipRequest | Relationship deletion request with subject_set

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PermissionsAPI.DeleteRelationship(context.Background()).DeleteRelationshipRequest(deleteRelationshipRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PermissionsAPI.DeleteRelationship``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `DeleteRelationship`: DeleteRelationship200Response
	fmt.Fprintf(os.Stdout, "Response from `V1PermissionsAPI.DeleteRelationship`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiDeleteRelationshipRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **deleteRelationshipRequest** | [**DeleteRelationshipRequest**](DeleteRelationshipRequest.md) | Relationship deletion request with subject_set | 

### Return type

[**DeleteRelationship200Response**](DeleteRelationship200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

