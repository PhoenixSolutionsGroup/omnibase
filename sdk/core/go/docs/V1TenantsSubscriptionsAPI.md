# \V1TenantsSubscriptionsAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**AddSubscription**](V1TenantsSubscriptionsAPI.md#AddSubscription) | **Post** /api/v1/tenants/subscriptions | Add a subscription to the tenant
[**GetTenantBillingStatus**](V1TenantsSubscriptionsAPI.md#GetTenantBillingStatus) | **Get** /api/v1/tenants/billing-status | Get tenant billing status
[**GetTenantSubscription**](V1TenantsSubscriptionsAPI.md#GetTenantSubscription) | **Get** /api/v1/tenants/subscriptions/{config_price_id} | Get a single tenant subscription
[**ListTenantSubscriptions**](V1TenantsSubscriptionsAPI.md#ListTenantSubscriptions) | **Get** /api/v1/tenants/subscriptions | List subscriptions for the tenant
[**RemoveSubscription**](V1TenantsSubscriptionsAPI.md#RemoveSubscription) | **Delete** /api/v1/tenants/subscriptions | Remove a subscription from the tenant



## AddSubscription

> AddResponse AddSubscription(ctx).AddRequest(addRequest).Execute()

Add a subscription to the tenant

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
	addRequest := *openapiclient.NewAddRequest("PlanId_example") // AddRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsSubscriptionsAPI.AddSubscription(context.Background()).AddRequest(addRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsSubscriptionsAPI.AddSubscription``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AddSubscription`: AddResponse
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsSubscriptionsAPI.AddSubscription`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiAddSubscriptionRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **addRequest** | [**AddRequest**](AddRequest.md) |  | 

### Return type

[**AddResponse**](AddResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetTenantBillingStatus

> BillingStatusResponse GetTenantBillingStatus(ctx).Execute()

Get tenant billing status

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
	resp, r, err := apiClient.V1TenantsSubscriptionsAPI.GetTenantBillingStatus(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsSubscriptionsAPI.GetTenantBillingStatus``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetTenantBillingStatus`: BillingStatusResponse
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsSubscriptionsAPI.GetTenantBillingStatus`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetTenantBillingStatusRequest struct via the builder pattern


### Return type

[**BillingStatusResponse**](BillingStatusResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetTenantSubscription

> SubscriptionResponse GetTenantSubscription(ctx, configPriceId).Execute()

Get a single tenant subscription

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
	configPriceId := "configPriceId_example" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsSubscriptionsAPI.GetTenantSubscription(context.Background(), configPriceId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsSubscriptionsAPI.GetTenantSubscription``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetTenantSubscription`: SubscriptionResponse
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsSubscriptionsAPI.GetTenantSubscription`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**configPriceId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetTenantSubscriptionRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**SubscriptionResponse**](SubscriptionResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListTenantSubscriptions

> []SubscriptionResponse ListTenantSubscriptions(ctx).Execute()

List subscriptions for the tenant

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
	resp, r, err := apiClient.V1TenantsSubscriptionsAPI.ListTenantSubscriptions(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsSubscriptionsAPI.ListTenantSubscriptions``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListTenantSubscriptions`: []SubscriptionResponse
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsSubscriptionsAPI.ListTenantSubscriptions`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiListTenantSubscriptionsRequest struct via the builder pattern


### Return type

[**[]SubscriptionResponse**](SubscriptionResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## RemoveSubscription

> RemoveResponse RemoveSubscription(ctx).RemoveRequest(removeRequest).Execute()

Remove a subscription from the tenant

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
	removeRequest := *openapiclient.NewRemoveRequest("PlanId_example") // RemoveRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsSubscriptionsAPI.RemoveSubscription(context.Background()).RemoveRequest(removeRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsSubscriptionsAPI.RemoveSubscription``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `RemoveSubscription`: RemoveResponse
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsSubscriptionsAPI.RemoveSubscription`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiRemoveSubscriptionRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **removeRequest** | [**RemoveRequest**](RemoveRequest.md) |  | 

### Return type

[**RemoveResponse**](RemoveResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

