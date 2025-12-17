# \V1PaymentsAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateCheckout**](V1PaymentsAPI.md#CreateCheckout) | **Post** /api/v1/payments/checkout | Create checkout session
[**CreateCustomerPortal**](V1PaymentsAPI.md#CreateCustomerPortal) | **Post** /api/v1/payments/portal | Create customer portal session
[**RecordUsage**](V1PaymentsAPI.md#RecordUsage) | **Post** /api/v1/payments/usage | Record metered usage



## CreateCheckout

> CreateCheckout200Response CreateCheckout(ctx).CreateCheckoutRequest(createCheckoutRequest).Execute()

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
	createCheckoutRequest := *openapiclient.NewCreateCheckoutRequest("price_test_basic", "https://test.example.com/success", "https://test.example.com/cancel") // CreateCheckoutRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.CreateCheckout(context.Background()).CreateCheckoutRequest(createCheckoutRequest).Execute()
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
 **createCheckoutRequest** | [**CreateCheckoutRequest**](CreateCheckoutRequest.md) |  | 

### Return type

[**CreateCheckout200Response**](CreateCheckout200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateCustomerPortal

> CreateCustomerPortal200Response CreateCustomerPortal(ctx).CreatePortalRequest(createPortalRequest).Execute()

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
	createPortalRequest := *openapiclient.NewCreatePortalRequest("https://test.example.com/dashboard") // CreatePortalRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.CreateCustomerPortal(context.Background()).CreatePortalRequest(createPortalRequest).Execute()
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
 **createPortalRequest** | [**CreatePortalRequest**](CreatePortalRequest.md) |  | 

### Return type

[**CreateCustomerPortal200Response**](CreateCustomerPortal200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## RecordUsage

> SuccessResponse RecordUsage(ctx).RecordUsageRequest(recordUsageRequest).Execute()

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
	recordUsageRequest := *openapiclient.NewRecordUsageRequest("api_requests", "100") // RecordUsageRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.RecordUsage(context.Background()).RecordUsageRequest(recordUsageRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.RecordUsage``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `RecordUsage`: SuccessResponse
	fmt.Fprintf(os.Stdout, "Response from `V1PaymentsAPI.RecordUsage`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiRecordUsageRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **recordUsageRequest** | [**RecordUsageRequest**](RecordUsageRequest.md) |  | 

### Return type

[**SuccessResponse**](SuccessResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

