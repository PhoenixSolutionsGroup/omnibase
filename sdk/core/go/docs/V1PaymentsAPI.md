# \V1PaymentsAPI

All URIs are relative to *http://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateCheckout**](V1PaymentsAPI.md#CreateCheckout) | **Post** /api/v1/payments/checkout | Create checkout session
[**CreateCustomerPortal**](V1PaymentsAPI.md#CreateCustomerPortal) | **Post** /api/v1/payments/portal | Create customer portal session
[**RecordUsage**](V1PaymentsAPI.md#RecordUsage) | **Post** /api/v1/payments/usage | Record metered usage



## CreateCheckout

> CreateCheckout200Response CreateCheckout(ctx).Request(request).Execute()

Create checkout session



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
	request := *openapiclient.NewV1CreateCheckoutRequest("https://example.com/cancel", "price_basic_monthly", "https://example.com/success") // V1CreateCheckoutRequest | Checkout session parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.CreateCheckout(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.CreateCheckout``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateCheckout`: CreateCheckout200Response
	fmt.Fprintf(os.Stdout, "Response from `V1PaymentsAPI.CreateCheckout`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateCheckoutRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**V1CreateCheckoutRequest**](V1CreateCheckoutRequest.md) | Checkout session parameters | 

### Return type

[**CreateCheckout200Response**](CreateCheckout200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateCustomerPortal

> CreateCustomerPortal200Response CreateCustomerPortal(ctx).Request(request).Execute()

Create customer portal session



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
	request := *openapiclient.NewV1CreatePortalRequest("https://example.com/dashboard") // V1CreatePortalRequest | Portal session parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.CreateCustomerPortal(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.CreateCustomerPortal``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateCustomerPortal`: CreateCustomerPortal200Response
	fmt.Fprintf(os.Stdout, "Response from `V1PaymentsAPI.CreateCustomerPortal`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateCustomerPortalRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**V1CreatePortalRequest**](V1CreatePortalRequest.md) | Portal session parameters | 

### Return type

[**CreateCustomerPortal200Response**](CreateCustomerPortal200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## RecordUsage

> HandlersSuccessResponse RecordUsage(ctx).Request(request).Execute()

Record metered usage



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
	request := *openapiclient.NewV1RecordUsageRequest("api_requests", "100") // V1RecordUsageRequest | Usage event parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.RecordUsage(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.RecordUsage``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `RecordUsage`: HandlersSuccessResponse
	fmt.Fprintf(os.Stdout, "Response from `V1PaymentsAPI.RecordUsage`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiRecordUsageRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**V1RecordUsageRequest**](V1RecordUsageRequest.md) | Usage event parameters | 

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

