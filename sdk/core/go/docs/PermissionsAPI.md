# \PermissionsAPI

All URIs are relative to *http://https://api.omnibase.tech/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CheckPermission**](PermissionsAPI.md#CheckPermission) | **Post** /permissions/check | Check permission
[**CreateRelationship**](PermissionsAPI.md#CreateRelationship) | **Post** /permissions/relationships | Create relationship
[**DeployPermissionNamespaces**](PermissionsAPI.md#DeployPermissionNamespaces) | **Post** /permissions/namespaces | Deploy Keto namespace configurations



## CheckPermission

> CheckPermission200Response CheckPermission(ctx).Body(body).Execute()

Check permission



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
	body := *openapiclient.NewV1CheckPermissionRequest("Tenant", "tenant-123", "view_db_secret_key") // V1CheckPermissionRequest | Permission check request

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.PermissionsAPI.CheckPermission(context.Background()).Body(body).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `PermissionsAPI.CheckPermission``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CheckPermission`: CheckPermission200Response
	fmt.Fprintf(os.Stdout, "Response from `PermissionsAPI.CheckPermission`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCheckPermissionRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**V1CheckPermissionRequest**](V1CheckPermissionRequest.md) | Permission check request | 

### Return type

[**CheckPermission200Response**](CheckPermission200Response.md)

### Authorization

[SessionAuth](../README.md#SessionAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateRelationship

> CreateRelationship200Response CreateRelationship(ctx).Body(body).Execute()

Create relationship



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
	body := *openapiclient.NewV1CreateRelationshipRequest("Project", "project-123", "tenant") // V1CreateRelationshipRequest | Relationship creation request

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.PermissionsAPI.CreateRelationship(context.Background()).Body(body).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `PermissionsAPI.CreateRelationship``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateRelationship`: CreateRelationship200Response
	fmt.Fprintf(os.Stdout, "Response from `PermissionsAPI.CreateRelationship`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateRelationshipRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**V1CreateRelationshipRequest**](V1CreateRelationshipRequest.md) | Relationship creation request | 

### Return type

[**CreateRelationship200Response**](CreateRelationship200Response.md)

### Authorization

[SessionAuth](../README.md#SessionAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DeployPermissionNamespaces

> DeployPermissionNamespaces200Response DeployPermissionNamespaces(ctx).Namespaces(namespaces).Execute()

Deploy Keto namespace configurations



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
	namespaces := os.NewFile(1234, "some_file") // *os.File | Zip file containing namespace configuration files

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.PermissionsAPI.DeployPermissionNamespaces(context.Background()).Namespaces(namespaces).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `PermissionsAPI.DeployPermissionNamespaces``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `DeployPermissionNamespaces`: DeployPermissionNamespaces200Response
	fmt.Fprintf(os.Stdout, "Response from `PermissionsAPI.DeployPermissionNamespaces`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiDeployPermissionNamespacesRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **namespaces** | ***os.File** | Zip file containing namespace configuration files | 

### Return type

[**DeployPermissionNamespaces200Response**](DeployPermissionNamespaces200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: multipart/form-data
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

