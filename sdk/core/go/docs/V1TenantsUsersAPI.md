# \V1TenantsUsersAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ListTenantUsers**](V1TenantsUsersAPI.md#ListTenantUsers) | **Get** /api/v1/tenants/users | List users in the tenant
[**RemoveTenantUser**](V1TenantsUsersAPI.md#RemoveTenantUser) | **Delete** /api/v1/tenants/users | Remove a user from the tenant
[**UpdateTenantUserRole**](V1TenantsUsersAPI.md#UpdateTenantUserRole) | **Put** /api/v1/tenants/users | Update a tenant user&#39;s role



## ListTenantUsers

> []UserResponse ListTenantUsers(ctx).Execute()

List users in the tenant

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

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsUsersAPI.ListTenantUsers(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsUsersAPI.ListTenantUsers``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListTenantUsers`: []UserResponse
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsUsersAPI.ListTenantUsers`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiListTenantUsersRequest struct via the builder pattern


### Return type

[**[]UserResponse**](UserResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## RemoveTenantUser

> interface{} RemoveTenantUser(ctx).DeleteRequest(deleteRequest).Execute()

Remove a user from the tenant

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
	deleteRequest := *openapiclient.NewDeleteRequest("UserId_example") // DeleteRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsUsersAPI.RemoveTenantUser(context.Background()).DeleteRequest(deleteRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsUsersAPI.RemoveTenantUser``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `RemoveTenantUser`: interface{}
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsUsersAPI.RemoveTenantUser`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiRemoveTenantUserRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **deleteRequest** | [**DeleteRequest**](DeleteRequest.md) |  | 

### Return type

**interface{}**

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## UpdateTenantUserRole

> UpdateUserRoleResponse UpdateTenantUserRole(ctx).UpdateUserRoleRequest(updateUserRoleRequest).Execute()

Update a tenant user's role

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
	updateUserRoleRequest := *openapiclient.NewUpdateUserRoleRequest("Role_example", "UserId_example") // UpdateUserRoleRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsUsersAPI.UpdateTenantUserRole(context.Background()).UpdateUserRoleRequest(updateUserRoleRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsUsersAPI.UpdateTenantUserRole``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `UpdateTenantUserRole`: UpdateUserRoleResponse
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsUsersAPI.UpdateTenantUserRole`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiUpdateTenantUserRoleRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **updateUserRoleRequest** | [**UpdateUserRoleRequest**](UpdateUserRoleRequest.md) |  | 

### Return type

[**UpdateUserRoleResponse**](UpdateUserRoleResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

