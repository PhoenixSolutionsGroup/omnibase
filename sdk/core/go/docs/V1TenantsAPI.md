# \V1TenantsAPI

All URIs are relative to *http://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**AcceptInvite**](V1TenantsAPI.md#AcceptInvite) | **Put** /api/v1/tenants/invites/accept | Accept tenant invite
[**AddSubscription**](V1TenantsAPI.md#AddSubscription) | **Post** /api/v1/payments/subscription/add | Add subscription
[**AssignRole**](V1TenantsAPI.md#AssignRole) | **Post** /api/v1/tenants/roles/assign/{user_id} | Assign role to user
[**CreateInvite**](V1TenantsAPI.md#CreateInvite) | **Post** /api/v1/tenants/invites | Create tenant invite
[**CreateRole**](V1TenantsAPI.md#CreateRole) | **Post** /api/v1/tenants/roles | Create role
[**CreateSubscription**](V1TenantsAPI.md#CreateSubscription) | **Post** /api/v1/payments/subscription | Create subscription
[**CreateTenant**](V1TenantsAPI.md#CreateTenant) | **Post** /api/v1/tenants | Create tenant
[**DeleteRole**](V1TenantsAPI.md#DeleteRole) | **Delete** /api/v1/tenants/roles/{role_id} | Delete role
[**DeleteTenant**](V1TenantsAPI.md#DeleteTenant) | **Delete** /api/v1/tenants | Delete tenant
[**GetRoleDefinitions**](V1TenantsAPI.md#GetRoleDefinitions) | **Get** /api/v1/tenants/roles/definitions | Get namespace definitions
[**GetTenantBillingStatus**](V1TenantsAPI.md#GetTenantBillingStatus) | **Get** /api/v1/tenants/billing-status | Get billing status
[**GetTenantJWT**](V1TenantsAPI.md#GetTenantJWT) | **Get** /api/v1/tenants/jwt | Get PostgREST JWT token
[**ListRoles**](V1TenantsAPI.md#ListRoles) | **Get** /api/v1/tenants/roles | List roles
[**ListTenantSubscriptions**](V1TenantsAPI.md#ListTenantSubscriptions) | **Get** /api/v1/tenants/subscriptions | Get tenant subscriptions
[**ListTenantUsers**](V1TenantsAPI.md#ListTenantUsers) | **Get** /api/v1/tenants/users | Get tenant users
[**RemoveSubscription**](V1TenantsAPI.md#RemoveSubscription) | **Delete** /api/v1/payments/subscription | Remove subscription
[**RemoveTenantUser**](V1TenantsAPI.md#RemoveTenantUser) | **Delete** /api/v1/tenants/users | Remove tenant user
[**SwitchActiveTenant**](V1TenantsAPI.md#SwitchActiveTenant) | **Put** /api/v1/tenants/switch-active | Switch active tenant
[**UpdateRole**](V1TenantsAPI.md#UpdateRole) | **Put** /api/v1/tenants/roles/{role_id} | Update role
[**UpdateTenantUserRole**](V1TenantsAPI.md#UpdateTenantUserRole) | **Put** /api/v1/tenants/users/role | Update user role



## AcceptInvite

> AcceptInvite200Response AcceptInvite(ctx).Request(request).Execute()

Accept tenant invite



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
	request := *openapiclient.NewTenantsAcceptInviteRequest("550e8400-e29b-41d4-a716-446655440000") // TenantsAcceptInviteRequest | Invite acceptance parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.AcceptInvite(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.AcceptInvite``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AcceptInvite`: AcceptInvite200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.AcceptInvite`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiAcceptInviteRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**TenantsAcceptInviteRequest**](TenantsAcceptInviteRequest.md) | Invite acceptance parameters | 

### Return type

[**AcceptInvite200Response**](AcceptInvite200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AddSubscription

> AddSubscription200Response AddSubscription(ctx).Request(request).Execute()

Add subscription



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
	request := *openapiclient.NewTenantsAddSubscriptionRequest("neon_compute_starter") // TenantsAddSubscriptionRequest | Subscription addition parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.AddSubscription(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.AddSubscription``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AddSubscription`: AddSubscription200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.AddSubscription`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiAddSubscriptionRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**TenantsAddSubscriptionRequest**](TenantsAddSubscriptionRequest.md) | Subscription addition parameters | 

### Return type

[**AddSubscription200Response**](AddSubscription200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AssignRole

> AssignRole200Response AssignRole(ctx, userId).Request(request).Execute()

Assign role to user



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
	userId := "userId_example" // string | User ID
	request := *openapiclient.NewTenantsAssignRoleRequest() // TenantsAssignRoleRequest | Role assignment parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.AssignRole(context.Background(), userId).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.AssignRole``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AssignRole`: AssignRole200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.AssignRole`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**userId** | **string** | User ID | 

### Other Parameters

Other parameters are passed through a pointer to a apiAssignRoleRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **request** | [**TenantsAssignRoleRequest**](TenantsAssignRoleRequest.md) | Role assignment parameters | 

### Return type

[**AssignRole200Response**](AssignRole200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateInvite

> CreateInvite200Response CreateInvite(ctx).Request(request).Execute()

Create tenant invite



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
	request := *openapiclient.NewTenantsCreateTenantUserInviteRequest("user@example.com", "https://app.example.com/accept-invite", "member") // TenantsCreateTenantUserInviteRequest | Invite creation parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.CreateInvite(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.CreateInvite``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateInvite`: CreateInvite200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.CreateInvite`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateInviteRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**TenantsCreateTenantUserInviteRequest**](TenantsCreateTenantUserInviteRequest.md) | Invite creation parameters | 

### Return type

[**CreateInvite200Response**](CreateInvite200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateRole

> CreateRole200Response CreateRole(ctx).Request(request).Execute()

Create role



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
	request := *openapiclient.NewTenantsCreateRoleRequest([]string{"Permissions_example"}, "project_viewer") // TenantsCreateRoleRequest | Role creation parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.CreateRole(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.CreateRole``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateRole`: CreateRole200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.CreateRole`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateRoleRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**TenantsCreateRoleRequest**](TenantsCreateRoleRequest.md) | Role creation parameters | 

### Return type

[**CreateRole200Response**](CreateRole200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateSubscription

> CreateSubscription200Response CreateSubscription(ctx).Request(request).Execute()

Create subscription



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
	request := *openapiclient.NewTenantsCreateSubscriptionRequest("neon_compute_starter") // TenantsCreateSubscriptionRequest | Subscription creation parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.CreateSubscription(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.CreateSubscription``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateSubscription`: CreateSubscription200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.CreateSubscription`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateSubscriptionRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**TenantsCreateSubscriptionRequest**](TenantsCreateSubscriptionRequest.md) | Subscription creation parameters | 

### Return type

[**CreateSubscription200Response**](CreateSubscription200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateTenant

> CreateTenant200Response CreateTenant(ctx).Request(request).Execute()

Create tenant



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
	request := *openapiclient.NewTenantsCreateTenantRequest("Acme Corp", "550e8400-e29b-41d4-a716-446655440000") // TenantsCreateTenantRequest | Tenant creation parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.CreateTenant(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.CreateTenant``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateTenant`: CreateTenant200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.CreateTenant`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateTenantRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**TenantsCreateTenantRequest**](TenantsCreateTenantRequest.md) | Tenant creation parameters | 

### Return type

[**CreateTenant200Response**](CreateTenant200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DeleteRole

> DeleteRole200Response DeleteRole(ctx, roleId).Execute()

Delete role



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
	roleId := "roleId_example" // string | Role ID

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.DeleteRole(context.Background(), roleId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.DeleteRole``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `DeleteRole`: DeleteRole200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.DeleteRole`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**roleId** | **string** | Role ID | 

### Other Parameters

Other parameters are passed through a pointer to a apiDeleteRoleRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**DeleteRole200Response**](DeleteRole200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DeleteTenant

> DeleteTenant200Response DeleteTenant(ctx).Execute()

Delete tenant



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
	resp, r, err := apiClient.V1TenantsAPI.DeleteTenant(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.DeleteTenant``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `DeleteTenant`: DeleteTenant200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.DeleteTenant`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiDeleteTenantRequest struct via the builder pattern


### Return type

[**DeleteTenant200Response**](DeleteTenant200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetRoleDefinitions

> GetRoleDefinitions200Response GetRoleDefinitions(ctx).Execute()

Get namespace definitions



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
	resp, r, err := apiClient.V1TenantsAPI.GetRoleDefinitions(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.GetRoleDefinitions``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetRoleDefinitions`: GetRoleDefinitions200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.GetRoleDefinitions`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetRoleDefinitionsRequest struct via the builder pattern


### Return type

[**GetRoleDefinitions200Response**](GetRoleDefinitions200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetTenantBillingStatus

> GetTenantBillingStatus200Response GetTenantBillingStatus(ctx).Execute()

Get billing status



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
	resp, r, err := apiClient.V1TenantsAPI.GetTenantBillingStatus(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.GetTenantBillingStatus``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetTenantBillingStatus`: GetTenantBillingStatus200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.GetTenantBillingStatus`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetTenantBillingStatusRequest struct via the builder pattern


### Return type

[**GetTenantBillingStatus200Response**](GetTenantBillingStatus200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetTenantJWT

> GetTenantJWT200Response GetTenantJWT(ctx).Execute()

Get PostgREST JWT token



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
	resp, r, err := apiClient.V1TenantsAPI.GetTenantJWT(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.GetTenantJWT``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetTenantJWT`: GetTenantJWT200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.GetTenantJWT`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetTenantJWTRequest struct via the builder pattern


### Return type

[**GetTenantJWT200Response**](GetTenantJWT200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListRoles

> ListRoles200Response ListRoles(ctx).Execute()

List roles



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
	resp, r, err := apiClient.V1TenantsAPI.ListRoles(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.ListRoles``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListRoles`: ListRoles200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.ListRoles`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiListRolesRequest struct via the builder pattern


### Return type

[**ListRoles200Response**](ListRoles200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListTenantSubscriptions

> ListTenantSubscriptions200Response ListTenantSubscriptions(ctx).Execute()

Get tenant subscriptions



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
	resp, r, err := apiClient.V1TenantsAPI.ListTenantSubscriptions(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.ListTenantSubscriptions``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListTenantSubscriptions`: ListTenantSubscriptions200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.ListTenantSubscriptions`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiListTenantSubscriptionsRequest struct via the builder pattern


### Return type

[**ListTenantSubscriptions200Response**](ListTenantSubscriptions200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListTenantUsers

> ListTenantUsers200Response ListTenantUsers(ctx).Execute()

Get tenant users



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
	resp, r, err := apiClient.V1TenantsAPI.ListTenantUsers(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.ListTenantUsers``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListTenantUsers`: ListTenantUsers200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.ListTenantUsers`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiListTenantUsersRequest struct via the builder pattern


### Return type

[**ListTenantUsers200Response**](ListTenantUsers200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## RemoveSubscription

> RemoveSubscription200Response RemoveSubscription(ctx).Request(request).Execute()

Remove subscription



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
	request := *openapiclient.NewTenantsRemoveSubscriptionRequest("neon_compute_starter") // TenantsRemoveSubscriptionRequest | Subscription removal parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.RemoveSubscription(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.RemoveSubscription``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `RemoveSubscription`: RemoveSubscription200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.RemoveSubscription`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiRemoveSubscriptionRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**TenantsRemoveSubscriptionRequest**](TenantsRemoveSubscriptionRequest.md) | Subscription removal parameters | 

### Return type

[**RemoveSubscription200Response**](RemoveSubscription200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## RemoveTenantUser

> HandlersSuccessResponse RemoveTenantUser(ctx).Request(request).Execute()

Remove tenant user



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
	request := *openapiclient.NewTenantsDeleteTenantUserRequest("550e8400-e29b-41d4-a716-446655440000") // TenantsDeleteTenantUserRequest | User removal parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.RemoveTenantUser(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.RemoveTenantUser``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `RemoveTenantUser`: HandlersSuccessResponse
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.RemoveTenantUser`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiRemoveTenantUserRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**TenantsDeleteTenantUserRequest**](TenantsDeleteTenantUserRequest.md) | User removal parameters | 

### Return type

[**HandlersSuccessResponse**](HandlersSuccessResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## SwitchActiveTenant

> SwitchActiveTenant200Response SwitchActiveTenant(ctx).Request(request).Execute()

Switch active tenant



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
	request := *openapiclient.NewTenantsSwitchTenantRequest("tenant-123") // TenantsSwitchTenantRequest | Tenant switch parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.SwitchActiveTenant(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.SwitchActiveTenant``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `SwitchActiveTenant`: SwitchActiveTenant200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.SwitchActiveTenant`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiSwitchActiveTenantRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**TenantsSwitchTenantRequest**](TenantsSwitchTenantRequest.md) | Tenant switch parameters | 

### Return type

[**SwitchActiveTenant200Response**](SwitchActiveTenant200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## UpdateRole

> CreateRole200Response UpdateRole(ctx, roleId).Request(request).Execute()

Update role



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
	roleId := "roleId_example" // string | Role ID
	request := *openapiclient.NewTenantsUpdateRoleRequest([]string{"Permissions_example"}) // TenantsUpdateRoleRequest | Role update parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.UpdateRole(context.Background(), roleId).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.UpdateRole``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `UpdateRole`: CreateRole200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.UpdateRole`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**roleId** | **string** | Role ID | 

### Other Parameters

Other parameters are passed through a pointer to a apiUpdateRoleRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **request** | [**TenantsUpdateRoleRequest**](TenantsUpdateRoleRequest.md) | Role update parameters | 

### Return type

[**CreateRole200Response**](CreateRole200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## UpdateTenantUserRole

> UpdateTenantUserRole200Response UpdateTenantUserRole(ctx).Request(request).Execute()

Update user role



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
	request := *openapiclient.NewTenantsUpdateTenantUserRoleRequest("admin", "550e8400-e29b-41d4-a716-446655440000") // TenantsUpdateTenantUserRoleRequest | Role update parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.UpdateTenantUserRole(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.UpdateTenantUserRole``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `UpdateTenantUserRole`: UpdateTenantUserRole200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.UpdateTenantUserRole`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiUpdateTenantUserRoleRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**TenantsUpdateTenantUserRoleRequest**](TenantsUpdateTenantUserRoleRequest.md) | Role update parameters | 

### Return type

[**UpdateTenantUserRole200Response**](UpdateTenantUserRole200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

