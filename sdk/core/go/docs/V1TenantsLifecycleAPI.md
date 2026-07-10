# \V1TenantsLifecycleAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateTenant**](V1TenantsLifecycleAPI.md#CreateTenant) | **Post** /api/v1/tenants | Create a tenant
[**DeleteTenant**](V1TenantsLifecycleAPI.md#DeleteTenant) | **Delete** /api/v1/tenants | Delete the current tenant
[**GetTenantByID**](V1TenantsLifecycleAPI.md#GetTenantByID) | **Get** /api/v1/tenants/by-id/{tenant_id} | Get tenant by ID
[**GetTenantByStripeCustomerID**](V1TenantsLifecycleAPI.md#GetTenantByStripeCustomerID) | **Get** /api/v1/tenants/by-stripe-customer/{stripe_customer_id} | Get tenant by Stripe customer ID
[**GetTenantJWT**](V1TenantsLifecycleAPI.md#GetTenantJWT) | **Get** /api/v1/tenants/jwt | Get JWT for the current tenant
[**SwitchActiveTenant**](V1TenantsLifecycleAPI.md#SwitchActiveTenant) | **Put** /api/v1/tenants/switch-active | Switch the active tenant



## CreateTenant

> CreateTenantResponse CreateTenant(ctx).CreateTenantRequest(createTenantRequest).Execute()

Create a tenant

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
	createTenantRequest := *openapiclient.NewCreateTenantRequest("BillingEmail_example", "Name_example", "Type_example") // CreateTenantRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsLifecycleAPI.CreateTenant(context.Background()).CreateTenantRequest(createTenantRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsLifecycleAPI.CreateTenant``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateTenant`: CreateTenantResponse
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsLifecycleAPI.CreateTenant`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateTenantRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createTenantRequest** | [**CreateTenantRequest**](CreateTenantRequest.md) |  | 

### Return type

[**CreateTenantResponse**](CreateTenantResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DeleteTenant

> DeleteTenantResponse DeleteTenant(ctx).Execute()

Delete the current tenant

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
	resp, r, err := apiClient.V1TenantsLifecycleAPI.DeleteTenant(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsLifecycleAPI.DeleteTenant``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `DeleteTenant`: DeleteTenantResponse
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsLifecycleAPI.DeleteTenant`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiDeleteTenantRequest struct via the builder pattern


### Return type

[**DeleteTenantResponse**](DeleteTenantResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetTenantByID

> GetTenantByIDRow GetTenantByID(ctx, tenantId).Execute()

Get tenant by ID

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
	tenantId := "tenantId_example" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsLifecycleAPI.GetTenantByID(context.Background(), tenantId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsLifecycleAPI.GetTenantByID``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetTenantByID`: GetTenantByIDRow
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsLifecycleAPI.GetTenantByID`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**tenantId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetTenantByIDRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**GetTenantByIDRow**](GetTenantByIDRow.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetTenantByStripeCustomerID

> GetTenantByStripeCustomerIDRow GetTenantByStripeCustomerID(ctx, stripeCustomerId).Execute()

Get tenant by Stripe customer ID

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
	stripeCustomerId := "stripeCustomerId_example" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsLifecycleAPI.GetTenantByStripeCustomerID(context.Background(), stripeCustomerId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsLifecycleAPI.GetTenantByStripeCustomerID``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetTenantByStripeCustomerID`: GetTenantByStripeCustomerIDRow
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsLifecycleAPI.GetTenantByStripeCustomerID`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**stripeCustomerId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetTenantByStripeCustomerIDRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**GetTenantByStripeCustomerIDRow**](GetTenantByStripeCustomerIDRow.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetTenantJWT

> JWTResponse GetTenantJWT(ctx).Execute()

Get JWT for the current tenant

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
	resp, r, err := apiClient.V1TenantsLifecycleAPI.GetTenantJWT(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsLifecycleAPI.GetTenantJWT``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetTenantJWT`: JWTResponse
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsLifecycleAPI.GetTenantJWT`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetTenantJWTRequest struct via the builder pattern


### Return type

[**JWTResponse**](JWTResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## SwitchActiveTenant

> SwitchActiveResponse SwitchActiveTenant(ctx).SwitchActiveRequest(switchActiveRequest).Execute()

Switch the active tenant

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
	switchActiveRequest := *openapiclient.NewSwitchActiveRequest("TenantId_example") // SwitchActiveRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsLifecycleAPI.SwitchActiveTenant(context.Background()).SwitchActiveRequest(switchActiveRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsLifecycleAPI.SwitchActiveTenant``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `SwitchActiveTenant`: SwitchActiveResponse
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsLifecycleAPI.SwitchActiveTenant`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiSwitchActiveTenantRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **switchActiveRequest** | [**SwitchActiveRequest**](SwitchActiveRequest.md) |  | 

### Return type

[**SwitchActiveResponse**](SwitchActiveResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

