# \V1PermissionsAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CheckPermission**](V1PermissionsAPI.md#CheckPermission) | **Post** /api/v1/permissions/check | Check permission
[**CreateRelationship**](V1PermissionsAPI.md#CreateRelationship) | **Post** /api/v1/permissions/relationships | Create relationship



## CheckPermission

> CheckPermission200Response CheckPermission(ctx).CheckPermissionRequest(checkPermissionRequest).Execute()

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
	checkPermissionRequest := openapiclient.CheckPermissionRequest{CheckPermissionRequestOneOf: openapiclient.NewCheckPermissionRequestOneOf("Namespace_example", "Object_example", "Relation_example", "SubjectId_example")} // CheckPermissionRequest | Permission check request with either subject_id or subject_set

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PermissionsAPI.CheckPermission(context.Background()).CheckPermissionRequest(checkPermissionRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PermissionsAPI.CheckPermission``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CheckPermission`: CheckPermission200Response
	fmt.Fprintf(os.Stdout, "Response from `V1PermissionsAPI.CheckPermission`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCheckPermissionRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **checkPermissionRequest** | [**CheckPermissionRequest**](CheckPermissionRequest.md) | Permission check request with either subject_id or subject_set | 

### Return type

[**CheckPermission200Response**](CheckPermission200Response.md)

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
	createRelationshipRequest := openapiclient.CreateRelationshipRequest{CreateRelationshipRequestOneOf: openapiclient.NewCreateRelationshipRequestOneOf("Namespace_example", "Object_example", "Relation_example", "SubjectId_example")} // CreateRelationshipRequest | Relationship creation request with either subject_id or subject_set

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
 **createRelationshipRequest** | [**CreateRelationshipRequest**](CreateRelationshipRequest.md) | Relationship creation request with either subject_id or subject_set | 

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

