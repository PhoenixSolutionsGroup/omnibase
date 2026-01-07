# \V1TenantsAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**AcceptInvite**](V1TenantsAPI.md#AcceptInvite) | **Put** /api/v1/tenants/invites/accept | Accept tenant invite
[**AddSubscription**](V1TenantsAPI.md#AddSubscription) | **Post** /api/v1/tenants/subscriptions | Add subscription
[**CreateInvite**](V1TenantsAPI.md#CreateInvite) | **Post** /api/v1/tenants/invites | Create tenant invite
[**CreateRole**](V1TenantsAPI.md#CreateRole) | **Post** /api/v1/tenants/roles | Create role
[**CreateTenant**](V1TenantsAPI.md#CreateTenant) | **Post** /api/v1/tenants | Create tenant
[**DeleteRole**](V1TenantsAPI.md#DeleteRole) | **Delete** /api/v1/tenants/roles/{role_id} | Delete role
[**DeleteTenant**](V1TenantsAPI.md#DeleteTenant) | **Delete** /api/v1/tenants | Delete tenant
[**GetRoleDefinitions**](V1TenantsAPI.md#GetRoleDefinitions) | **Get** /api/v1/tenants/roles/definitions | Get namespace definitions
[**GetTenantBillingStatus**](V1TenantsAPI.md#GetTenantBillingStatus) | **Get** /api/v1/tenants/billing-status | Get billing status
[**GetTenantByID**](V1TenantsAPI.md#GetTenantByID) | **Get** /api/v1/tenants/by-id/{tenant_id} | Get tenant by ID
[**GetTenantByStripeCustomerID**](V1TenantsAPI.md#GetTenantByStripeCustomerID) | **Get** /api/v1/tenants/by-stripe-customer/{stripe_customer_id} | Get tenant by Stripe customer ID
[**GetTenantJWT**](V1TenantsAPI.md#GetTenantJWT) | **Get** /api/v1/tenants/jwt | Get PostgREST JWT token
[**GetTenantSubscription**](V1TenantsAPI.md#GetTenantSubscription) | **Get** /api/v1/tenants/subscriptions/{config_price_id} | Get tenant subscription by plan
[**ListRoles**](V1TenantsAPI.md#ListRoles) | **Get** /api/v1/tenants/roles | List roles
[**ListTenantSubscriptions**](V1TenantsAPI.md#ListTenantSubscriptions) | **Get** /api/v1/tenants/subscriptions | Get tenant subscriptions
[**ListTenantUsers**](V1TenantsAPI.md#ListTenantUsers) | **Get** /api/v1/tenants/users | Get tenant users
[**RemoveSubscription**](V1TenantsAPI.md#RemoveSubscription) | **Delete** /api/v1/tenants/subscriptions | Remove subscription
[**RemoveTenantUser**](V1TenantsAPI.md#RemoveTenantUser) | **Delete** /api/v1/tenants/users | Remove tenant user
[**SwitchActiveTenant**](V1TenantsAPI.md#SwitchActiveTenant) | **Put** /api/v1/tenants/switch-active | Switch active tenant
[**UpdateRole**](V1TenantsAPI.md#UpdateRole) | **Put** /api/v1/tenants/roles/{role_id} | Update role
[**UpdateTenantUserRole**](V1TenantsAPI.md#UpdateTenantUserRole) | **Put** /api/v1/tenants/users | Update user role



## AcceptInvite

> AcceptInvite200Response AcceptInvite(ctx).AcceptInviteRequest(acceptInviteRequest).XUserId(xUserId).Execute()

Accept tenant invite



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
	acceptInviteRequest := *openapiclient.NewAcceptInviteRequest("tok_test_abc123xyz") // AcceptInviteRequest | 
	xUserId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | User ID (UUID) - Required when using X-Service-Key header (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.AcceptInvite(context.Background()).AcceptInviteRequest(acceptInviteRequest).XUserId(xUserId).Execute()
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
 **acceptInviteRequest** | [**AcceptInviteRequest**](AcceptInviteRequest.md) |  | 
 **xUserId** | **string** | User ID (UUID) - Required when using X-Service-Key header | 

### Return type

[**AcceptInvite200Response**](AcceptInvite200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AddSubscription

> AddSubscription200Response AddSubscription(ctx).AddSubscriptionRequest(addSubscriptionRequest).Execute()

Add subscription



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
	addSubscriptionRequest := *openapiclient.NewAddSubscriptionRequest("price_test_basic") // AddSubscriptionRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.AddSubscription(context.Background()).AddSubscriptionRequest(addSubscriptionRequest).Execute()
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
 **addSubscriptionRequest** | [**AddSubscriptionRequest**](AddSubscriptionRequest.md) |  | 

### Return type

[**AddSubscription200Response**](AddSubscription200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateInvite

> CreateInvite200Response CreateInvite(ctx).CreateTenantUserInviteRequest(createTenantUserInviteRequest).XUserId(xUserId).XTenantId(xTenantId).Execute()

Create tenant invite



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
	createTenantUserInviteRequest := *openapiclient.NewCreateTenantUserInviteRequest("test@example.com", "member", "https://test.example.com/accept-invite") // CreateTenantUserInviteRequest | 
	xUserId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | User ID (UUID) - Required when using X-Service-Key header (optional)
	xTenantId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.CreateInvite(context.Background()).CreateTenantUserInviteRequest(createTenantUserInviteRequest).XUserId(xUserId).XTenantId(xTenantId).Execute()
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
 **createTenantUserInviteRequest** | [**CreateTenantUserInviteRequest**](CreateTenantUserInviteRequest.md) |  | 
 **xUserId** | **string** | User ID (UUID) - Required when using X-Service-Key header | 
 **xTenantId** | **string** | Tenant ID (UUID) - Required when using X-Service-Key header | 

### Return type

[**CreateInvite200Response**](CreateInvite200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateRole

> CreateRole200Response CreateRole(ctx).CreateRoleRequest(createRoleRequest).XUserId(xUserId).XTenantId(xTenantId).Execute()

Create role



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
	createRoleRequest := *openapiclient.NewCreateRoleRequest("test_project_viewer", []string{"Permissions_example"}) // CreateRoleRequest | 
	xUserId := "550e8400-e29b-41d4-a716-446655440000" // string | User ID (UUID) - Required when using X-Service-Key header (optional)
	xTenantId := "31c60057-bd7c-41b8-b96e-c4ceb845034f" // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.CreateRole(context.Background()).CreateRoleRequest(createRoleRequest).XUserId(xUserId).XTenantId(xTenantId).Execute()
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
 **createRoleRequest** | [**CreateRoleRequest**](CreateRoleRequest.md) |  | 
 **xUserId** | **string** | User ID (UUID) - Required when using X-Service-Key header | 
 **xTenantId** | **string** | Tenant ID (UUID) - Required when using X-Service-Key header | 

### Return type

[**CreateRole200Response**](CreateRole200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateTenant

> CreateTenant200Response CreateTenant(ctx).CreateTenantRequest(createTenantRequest).XUserId(xUserId).Execute()

Create tenant



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
	createTenantRequest := *openapiclient.NewCreateTenantRequest("Test Organization") // CreateTenantRequest | 
	xUserId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | User ID (UUID) - Required when using service key authentication (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.CreateTenant(context.Background()).CreateTenantRequest(createTenantRequest).XUserId(xUserId).Execute()
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
 **createTenantRequest** | [**CreateTenantRequest**](CreateTenantRequest.md) |  | 
 **xUserId** | **string** | User ID (UUID) - Required when using service key authentication | 

### Return type

[**CreateTenant200Response**](CreateTenant200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DeleteRole

> DeleteRole200Response DeleteRole(ctx, roleId).XUserId(xUserId).XTenantId(xTenantId).Execute()

Delete role



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
	roleId := "roleId_example" // string | Role ID
	xUserId := "550e8400-e29b-41d4-a716-446655440000" // string | User ID (UUID) - Required when using X-Service-Key header (optional)
	xTenantId := "31c60057-bd7c-41b8-b96e-c4ceb845034f" // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.DeleteRole(context.Background(), roleId).XUserId(xUserId).XTenantId(xTenantId).Execute()
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

 **xUserId** | **string** | User ID (UUID) - Required when using X-Service-Key header | 
 **xTenantId** | **string** | Tenant ID (UUID) - Required when using X-Service-Key header | 

### Return type

[**DeleteRole200Response**](DeleteRole200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DeleteTenant

> DeleteTenant200Response DeleteTenant(ctx).XUserId(xUserId).XTenantId(xTenantId).Execute()

Delete tenant



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
	xUserId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | User ID (UUID) - Required when using X-Service-Key header (optional)
	xTenantId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.DeleteTenant(context.Background()).XUserId(xUserId).XTenantId(xTenantId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.DeleteTenant``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `DeleteTenant`: DeleteTenant200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.DeleteTenant`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiDeleteTenantRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xUserId** | **string** | User ID (UUID) - Required when using X-Service-Key header | 
 **xTenantId** | **string** | Tenant ID (UUID) - Required when using X-Service-Key header | 

### Return type

[**DeleteTenant200Response**](DeleteTenant200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetRoleDefinitions

> GetRoleDefinitions200Response GetRoleDefinitions(ctx).Subject(subject).Execute()

Get namespace definitions



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
	subject := "ApiKey" // string | Filter to only return relations that accept this subject type (e.g., \"ApiKey\", \"User\") (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.GetRoleDefinitions(context.Background()).Subject(subject).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.GetRoleDefinitions``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetRoleDefinitions`: GetRoleDefinitions200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.GetRoleDefinitions`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiGetRoleDefinitionsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **subject** | **string** | Filter to only return relations that accept this subject type (e.g., \&quot;ApiKey\&quot;, \&quot;User\&quot;) | 

### Return type

[**GetRoleDefinitions200Response**](GetRoleDefinitions200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

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
	openapiclient "github.com/PhoenixSolutionsGroup/omnibase/sdk/core/go"
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

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetTenantByID

> GetTenantByID200Response GetTenantByID(ctx, tenantId).Execute()

Get tenant by ID



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
	tenantId := "7d5da463-8351-4abe-870c-8ccdefc4d78c" // string | Tenant ID (UUID)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.GetTenantByID(context.Background(), tenantId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.GetTenantByID``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetTenantByID`: GetTenantByID200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.GetTenantByID`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**tenantId** | **string** | Tenant ID (UUID) | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetTenantByIDRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**GetTenantByID200Response**](GetTenantByID200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetTenantByStripeCustomerID

> GetTenantByStripeCustomerID200Response GetTenantByStripeCustomerID(ctx, stripeCustomerId).Execute()

Get tenant by Stripe customer ID



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
	stripeCustomerId := "cus_TOWEstcga5ou7a" // string | Stripe customer ID

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.GetTenantByStripeCustomerID(context.Background(), stripeCustomerId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.GetTenantByStripeCustomerID``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetTenantByStripeCustomerID`: GetTenantByStripeCustomerID200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.GetTenantByStripeCustomerID`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**stripeCustomerId** | **string** | Stripe customer ID | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetTenantByStripeCustomerIDRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**GetTenantByStripeCustomerID200Response**](GetTenantByStripeCustomerID200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetTenantJWT

> GetTenantJWT200Response GetTenantJWT(ctx).XUserId(xUserId).XTenantId(xTenantId).Execute()

Get PostgREST JWT token



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
	xUserId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | User ID (UUID) - Required when using X-Service-Key header (optional)
	xTenantId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.GetTenantJWT(context.Background()).XUserId(xUserId).XTenantId(xTenantId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.GetTenantJWT``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetTenantJWT`: GetTenantJWT200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.GetTenantJWT`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiGetTenantJWTRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xUserId** | **string** | User ID (UUID) - Required when using X-Service-Key header | 
 **xTenantId** | **string** | Tenant ID (UUID) - Required when using X-Service-Key header | 

### Return type

[**GetTenantJWT200Response**](GetTenantJWT200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetTenantSubscription

> GetTenantSubscription200Response GetTenantSubscription(ctx, configPriceId).Execute()

Get tenant subscription by plan



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
	configPriceId := "neon_compute_starter" // string | The configuration price ID (plan ID) to look up

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.GetTenantSubscription(context.Background(), configPriceId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.GetTenantSubscription``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetTenantSubscription`: GetTenantSubscription200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.GetTenantSubscription`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**configPriceId** | **string** | The configuration price ID (plan ID) to look up | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetTenantSubscriptionRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**GetTenantSubscription200Response**](GetTenantSubscription200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListRoles

> ListRoles200Response ListRoles(ctx).XTenantId(xTenantId).Execute()

List roles



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
	xTenantId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.ListRoles(context.Background()).XTenantId(xTenantId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.ListRoles``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListRoles`: ListRoles200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.ListRoles`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiListRolesRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xTenantId** | **string** | Tenant ID (UUID) - Required when using X-Service-Key header | 

### Return type

[**ListRoles200Response**](ListRoles200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

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
	openapiclient "github.com/PhoenixSolutionsGroup/omnibase/sdk/core/go"
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

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListTenantUsers

> ListTenantUsers200Response ListTenantUsers(ctx).XUserId(xUserId).XTenantId(xTenantId).Execute()

Get tenant users



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
	xUserId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | User ID (UUID) - Required when using X-Service-Key header (optional)
	xTenantId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.ListTenantUsers(context.Background()).XUserId(xUserId).XTenantId(xTenantId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.ListTenantUsers``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListTenantUsers`: ListTenantUsers200Response
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.ListTenantUsers`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiListTenantUsersRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xUserId** | **string** | User ID (UUID) - Required when using X-Service-Key header | 
 **xTenantId** | **string** | Tenant ID (UUID) - Required when using X-Service-Key header | 

### Return type

[**ListTenantUsers200Response**](ListTenantUsers200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## RemoveSubscription

> RemoveSubscription200Response RemoveSubscription(ctx).RemoveSubscriptionRequest(removeSubscriptionRequest).Execute()

Remove subscription



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
	removeSubscriptionRequest := *openapiclient.NewRemoveSubscriptionRequest("price_test_basic") // RemoveSubscriptionRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.RemoveSubscription(context.Background()).RemoveSubscriptionRequest(removeSubscriptionRequest).Execute()
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
 **removeSubscriptionRequest** | [**RemoveSubscriptionRequest**](RemoveSubscriptionRequest.md) |  | 

### Return type

[**RemoveSubscription200Response**](RemoveSubscription200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## RemoveTenantUser

> SuccessResponse RemoveTenantUser(ctx).DeleteTenantUserRequest(deleteTenantUserRequest).Execute()

Remove tenant user



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
	deleteTenantUserRequest := *openapiclient.NewDeleteTenantUserRequest("550e8400-e29b-41d4-a716-446655440001") // DeleteTenantUserRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.RemoveTenantUser(context.Background()).DeleteTenantUserRequest(deleteTenantUserRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsAPI.RemoveTenantUser``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `RemoveTenantUser`: SuccessResponse
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsAPI.RemoveTenantUser`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiRemoveTenantUserRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **deleteTenantUserRequest** | [**DeleteTenantUserRequest**](DeleteTenantUserRequest.md) |  | 

### Return type

[**SuccessResponse**](SuccessResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## SwitchActiveTenant

> SwitchActiveTenant200Response SwitchActiveTenant(ctx).SwitchTenantRequest(switchTenantRequest).XUserId(xUserId).Execute()

Switch active tenant



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
	switchTenantRequest := *openapiclient.NewSwitchTenantRequest("tenant_test_123") // SwitchTenantRequest | 
	xUserId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | User ID (UUID) - Required when using X-Service-Key header (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.SwitchActiveTenant(context.Background()).SwitchTenantRequest(switchTenantRequest).XUserId(xUserId).Execute()
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
 **switchTenantRequest** | [**SwitchTenantRequest**](SwitchTenantRequest.md) |  | 
 **xUserId** | **string** | User ID (UUID) - Required when using X-Service-Key header | 

### Return type

[**SwitchActiveTenant200Response**](SwitchActiveTenant200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## UpdateRole

> CreateRole200Response UpdateRole(ctx, roleId).UpdateRoleRequest(updateRoleRequest).XUserId(xUserId).XTenantId(xTenantId).Execute()

Update role



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
	roleId := "roleId_example" // string | Role ID
	updateRoleRequest := *openapiclient.NewUpdateRoleRequest([]string{"Permissions_example"}) // UpdateRoleRequest | 
	xUserId := "550e8400-e29b-41d4-a716-446655440000" // string | User ID (UUID) - Required when using X-Service-Key header (optional)
	xTenantId := "31c60057-bd7c-41b8-b96e-c4ceb845034f" // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.UpdateRole(context.Background(), roleId).UpdateRoleRequest(updateRoleRequest).XUserId(xUserId).XTenantId(xTenantId).Execute()
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

 **updateRoleRequest** | [**UpdateRoleRequest**](UpdateRoleRequest.md) |  | 
 **xUserId** | **string** | User ID (UUID) - Required when using X-Service-Key header | 
 **xTenantId** | **string** | Tenant ID (UUID) - Required when using X-Service-Key header | 

### Return type

[**CreateRole200Response**](CreateRole200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## UpdateTenantUserRole

> UpdateTenantUserRole200Response UpdateTenantUserRole(ctx).UpdateTenantUserRoleRequest(updateTenantUserRoleRequest).XUserId(xUserId).XTenantId(xTenantId).Execute()

Update user role



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
	updateTenantUserRoleRequest := *openapiclient.NewUpdateTenantUserRoleRequest("member", "550e8400-e29b-41d4-a716-446655440001") // UpdateTenantUserRoleRequest | 
	xUserId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | User ID (UUID) - Required when using X-Service-Key header (optional)
	xTenantId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | Tenant ID (UUID) - Required when using X-Service-Key header (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsAPI.UpdateTenantUserRole(context.Background()).UpdateTenantUserRoleRequest(updateTenantUserRoleRequest).XUserId(xUserId).XTenantId(xTenantId).Execute()
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
 **updateTenantUserRoleRequest** | [**UpdateTenantUserRoleRequest**](UpdateTenantUserRoleRequest.md) |  | 
 **xUserId** | **string** | User ID (UUID) - Required when using X-Service-Key header | 
 **xTenantId** | **string** | Tenant ID (UUID) - Required when using X-Service-Key header | 

### Return type

[**UpdateTenantUserRole200Response**](UpdateTenantUserRole200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

