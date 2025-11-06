# \PaymentsAPI

All URIs are relative to *http://https://api.omnibase.tech/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateCheckout**](PaymentsAPI.md#CreateCheckout) | **Post** /payments/checkout | Create checkout session
[**CreateCustomerPortal**](PaymentsAPI.md#CreateCustomerPortal) | **Post** /payments/portal | Create customer portal session
[**RecordUsage**](PaymentsAPI.md#RecordUsage) | **Post** /payments/usage | Record metered usage



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
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	request := *openapiclient.NewV1CreateCheckoutRequest("https://example.com/cancel", "price_basic_monthly", "https://example.com/success") // V1CreateCheckoutRequest | Checkout session parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.PaymentsAPI.CreateCheckout(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `PaymentsAPI.CreateCheckout``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateCheckout`: CreateCheckout200Response
	fmt.Fprintf(os.Stdout, "Response from `PaymentsAPI.CreateCheckout`: %v\n", resp)
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
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	request := *openapiclient.NewV1CreatePortalRequest("https://example.com/dashboard") // V1CreatePortalRequest | Portal session parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.PaymentsAPI.CreateCustomerPortal(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `PaymentsAPI.CreateCustomerPortal``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateCustomerPortal`: CreateCustomerPortal200Response
	fmt.Fprintf(os.Stdout, "Response from `PaymentsAPI.CreateCustomerPortal`: %v\n", resp)
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
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	request := *openapiclient.NewV1RecordUsageRequest("api_requests", "100") // V1RecordUsageRequest | Usage event parameters

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.PaymentsAPI.RecordUsage(context.Background()).Request(request).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `PaymentsAPI.RecordUsage``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `RecordUsage`: HandlersSuccessResponse
	fmt.Fprintf(os.Stdout, "Response from `PaymentsAPI.RecordUsage`: %v\n", resp)
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

