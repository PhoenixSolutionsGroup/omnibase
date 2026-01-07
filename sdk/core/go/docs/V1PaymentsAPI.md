# \V1PaymentsAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**AddInvoiceLineItem**](V1PaymentsAPI.md#AddInvoiceLineItem) | **Post** /api/v1/payments/invoices/{invoice_id}/items | Add invoice line item
[**AddInvoiceLineItemWithPriceId**](V1PaymentsAPI.md#AddInvoiceLineItemWithPriceId) | **Post** /api/v1/payments/invoices/{invoice_id}/items/price | Add invoice line item with price ID
[**CreateCheckout**](V1PaymentsAPI.md#CreateCheckout) | **Post** /api/v1/payments/checkout | Create checkout session
[**CreateCustomerPortal**](V1PaymentsAPI.md#CreateCustomerPortal) | **Post** /api/v1/payments/portal | Create customer portal session
[**CreateInvoice**](V1PaymentsAPI.md#CreateInvoice) | **Post** /api/v1/payments/invoices | Create invoice
[**FinalizeInvoice**](V1PaymentsAPI.md#FinalizeInvoice) | **Post** /api/v1/payments/invoices/{invoice_id}/finalize | Finalize invoice
[**GetInvoice**](V1PaymentsAPI.md#GetInvoice) | **Get** /api/v1/payments/invoices/{invoice_id} | Get invoice
[**RecordUsage**](V1PaymentsAPI.md#RecordUsage) | **Post** /api/v1/payments/usage | Record metered usage
[**UpdateInvoice**](V1PaymentsAPI.md#UpdateInvoice) | **Patch** /api/v1/payments/invoices/{invoice_id} | Update invoice



## AddInvoiceLineItem

> AddInvoiceLineItem200Response AddInvoiceLineItem(ctx, invoiceId).XServiceKey(xServiceKey).AddInvoiceLineItemRequest(addInvoiceLineItemRequest).XTenantId(xTenantId).XStripeCustomerId(xStripeCustomerId).Execute()

Add invoice line item



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
	xServiceKey := "xServiceKey_example" // string | Service key for authentication
	invoiceId := "invoiceId_example" // string | Stripe Invoice ID
	addInvoiceLineItemRequest := *openapiclient.NewAddInvoiceLineItemRequest(int64(1000), "Platform fee", openapiclient.CurrencyCode("usd")) // AddInvoiceLineItemRequest | 
	xTenantId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | Tenant ID (UUID) - Used to look up the Stripe customer ID from tenant configuration. Required if X-Stripe-Customer-Id is not provided. (optional)
	xStripeCustomerId := "xStripeCustomerId_example" // string | Stripe Customer ID (e.g., cus_xxx) - Directly specify the customer. Required if X-Tenant-Id is not provided. (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.AddInvoiceLineItem(context.Background(), invoiceId).XServiceKey(xServiceKey).AddInvoiceLineItemRequest(addInvoiceLineItemRequest).XTenantId(xTenantId).XStripeCustomerId(xStripeCustomerId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.AddInvoiceLineItem``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AddInvoiceLineItem`: AddInvoiceLineItem200Response
	fmt.Fprintf(os.Stdout, "Response from `V1PaymentsAPI.AddInvoiceLineItem`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**invoiceId** | **string** | Stripe Invoice ID | 

### Other Parameters

Other parameters are passed through a pointer to a apiAddInvoiceLineItemRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xServiceKey** | **string** | Service key for authentication | 

 **addInvoiceLineItemRequest** | [**AddInvoiceLineItemRequest**](AddInvoiceLineItemRequest.md) |  | 
 **xTenantId** | **string** | Tenant ID (UUID) - Used to look up the Stripe customer ID from tenant configuration. Required if X-Stripe-Customer-Id is not provided. | 
 **xStripeCustomerId** | **string** | Stripe Customer ID (e.g., cus_xxx) - Directly specify the customer. Required if X-Tenant-Id is not provided. | 

### Return type

[**AddInvoiceLineItem200Response**](AddInvoiceLineItem200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AddInvoiceLineItemWithPriceId

> AddInvoiceLineItem200Response AddInvoiceLineItemWithPriceId(ctx, invoiceId).XServiceKey(xServiceKey).AddInvoiceLineItemWithPriceIDRequest(addInvoiceLineItemWithPriceIDRequest).XTenantId(xTenantId).XStripeCustomerId(xStripeCustomerId).Execute()

Add invoice line item with price ID



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
	xServiceKey := "xServiceKey_example" // string | Service key for authentication
	invoiceId := "invoiceId_example" // string | Stripe Invoice ID
	addInvoiceLineItemWithPriceIDRequest := openapiclient.AddInvoiceLineItemWithPriceIDRequest{AddInvoiceLineItemWithConfigPriceRequest: openapiclient.NewAddInvoiceLineItemWithConfigPriceRequest("hetzner_cx23_nbg1_hourly", int64(720), "VPS Compute - 720 hours", openapiclient.CurrencyCode("usd"))} // AddInvoiceLineItemWithPriceIDRequest | 
	xTenantId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | Tenant ID (UUID) - Used to look up the Stripe customer ID from tenant configuration. Required if X-Stripe-Customer-Id is not provided. (optional)
	xStripeCustomerId := "xStripeCustomerId_example" // string | Stripe Customer ID (e.g., cus_xxx) - Directly specify the customer. Required if X-Tenant-Id is not provided. (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.AddInvoiceLineItemWithPriceId(context.Background(), invoiceId).XServiceKey(xServiceKey).AddInvoiceLineItemWithPriceIDRequest(addInvoiceLineItemWithPriceIDRequest).XTenantId(xTenantId).XStripeCustomerId(xStripeCustomerId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.AddInvoiceLineItemWithPriceId``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AddInvoiceLineItemWithPriceId`: AddInvoiceLineItem200Response
	fmt.Fprintf(os.Stdout, "Response from `V1PaymentsAPI.AddInvoiceLineItemWithPriceId`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**invoiceId** | **string** | Stripe Invoice ID | 

### Other Parameters

Other parameters are passed through a pointer to a apiAddInvoiceLineItemWithPriceIdRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xServiceKey** | **string** | Service key for authentication | 

 **addInvoiceLineItemWithPriceIDRequest** | [**AddInvoiceLineItemWithPriceIDRequest**](AddInvoiceLineItemWithPriceIDRequest.md) |  | 
 **xTenantId** | **string** | Tenant ID (UUID) - Used to look up the Stripe customer ID from tenant configuration. Required if X-Stripe-Customer-Id is not provided. | 
 **xStripeCustomerId** | **string** | Stripe Customer ID (e.g., cus_xxx) - Directly specify the customer. Required if X-Tenant-Id is not provided. | 

### Return type

[**AddInvoiceLineItem200Response**](AddInvoiceLineItem200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


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
	openapiclient "github.com/PhoenixSolutionsGroup/omnibase/sdk/core/go"
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
	openapiclient "github.com/PhoenixSolutionsGroup/omnibase/sdk/core/go"
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


## CreateInvoice

> CreateInvoice200Response CreateInvoice(ctx).XServiceKey(xServiceKey).CreateInvoiceRequest(createInvoiceRequest).XTenantId(xTenantId).XStripeCustomerId(xStripeCustomerId).Execute()

Create invoice



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
	xServiceKey := "xServiceKey_example" // string | Service key for authentication
	createInvoiceRequest := *openapiclient.NewCreateInvoiceRequest(openapiclient.CurrencyCode("usd")) // CreateInvoiceRequest | 
	xTenantId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | Tenant ID (UUID) - Used to look up the Stripe customer ID from tenant configuration. Required if X-Stripe-Customer-Id is not provided. (optional)
	xStripeCustomerId := "xStripeCustomerId_example" // string | Stripe Customer ID (e.g., cus_xxx) - Directly specify the customer. Required if X-Tenant-Id is not provided. (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.CreateInvoice(context.Background()).XServiceKey(xServiceKey).CreateInvoiceRequest(createInvoiceRequest).XTenantId(xTenantId).XStripeCustomerId(xStripeCustomerId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.CreateInvoice``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateInvoice`: CreateInvoice200Response
	fmt.Fprintf(os.Stdout, "Response from `V1PaymentsAPI.CreateInvoice`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateInvoiceRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xServiceKey** | **string** | Service key for authentication | 
 **createInvoiceRequest** | [**CreateInvoiceRequest**](CreateInvoiceRequest.md) |  | 
 **xTenantId** | **string** | Tenant ID (UUID) - Used to look up the Stripe customer ID from tenant configuration. Required if X-Stripe-Customer-Id is not provided. | 
 **xStripeCustomerId** | **string** | Stripe Customer ID (e.g., cus_xxx) - Directly specify the customer. Required if X-Tenant-Id is not provided. | 

### Return type

[**CreateInvoice200Response**](CreateInvoice200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## FinalizeInvoice

> CreateInvoice200Response FinalizeInvoice(ctx, invoiceId).XServiceKey(xServiceKey).FinalizeInvoiceRequest(finalizeInvoiceRequest).Execute()

Finalize invoice



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
	xServiceKey := "xServiceKey_example" // string | Service key for authentication
	invoiceId := "invoiceId_example" // string | Stripe Invoice ID
	finalizeInvoiceRequest := *openapiclient.NewFinalizeInvoiceRequest() // FinalizeInvoiceRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.FinalizeInvoice(context.Background(), invoiceId).XServiceKey(xServiceKey).FinalizeInvoiceRequest(finalizeInvoiceRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.FinalizeInvoice``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `FinalizeInvoice`: CreateInvoice200Response
	fmt.Fprintf(os.Stdout, "Response from `V1PaymentsAPI.FinalizeInvoice`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**invoiceId** | **string** | Stripe Invoice ID | 

### Other Parameters

Other parameters are passed through a pointer to a apiFinalizeInvoiceRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xServiceKey** | **string** | Service key for authentication | 

 **finalizeInvoiceRequest** | [**FinalizeInvoiceRequest**](FinalizeInvoiceRequest.md) |  | 

### Return type

[**CreateInvoice200Response**](CreateInvoice200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetInvoice

> CreateInvoice200Response GetInvoice(ctx, invoiceId).XServiceKey(xServiceKey).Execute()

Get invoice



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
	xServiceKey := "xServiceKey_example" // string | Service key for authentication
	invoiceId := "invoiceId_example" // string | Stripe Invoice ID

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.GetInvoice(context.Background(), invoiceId).XServiceKey(xServiceKey).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.GetInvoice``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetInvoice`: CreateInvoice200Response
	fmt.Fprintf(os.Stdout, "Response from `V1PaymentsAPI.GetInvoice`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**invoiceId** | **string** | Stripe Invoice ID | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetInvoiceRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xServiceKey** | **string** | Service key for authentication | 


### Return type

[**CreateInvoice200Response**](CreateInvoice200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
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
	openapiclient "github.com/PhoenixSolutionsGroup/omnibase/sdk/core/go"
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


## UpdateInvoice

> CreateInvoice200Response UpdateInvoice(ctx, invoiceId).XServiceKey(xServiceKey).UpdateInvoiceRequest(updateInvoiceRequest).Execute()

Update invoice



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
	xServiceKey := "xServiceKey_example" // string | Service key for authentication
	invoiceId := "invoiceId_example" // string | Stripe Invoice ID
	updateInvoiceRequest := *openapiclient.NewUpdateInvoiceRequest() // UpdateInvoiceRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.UpdateInvoice(context.Background(), invoiceId).XServiceKey(xServiceKey).UpdateInvoiceRequest(updateInvoiceRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.UpdateInvoice``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `UpdateInvoice`: CreateInvoice200Response
	fmt.Fprintf(os.Stdout, "Response from `V1PaymentsAPI.UpdateInvoice`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**invoiceId** | **string** | Stripe Invoice ID | 

### Other Parameters

Other parameters are passed through a pointer to a apiUpdateInvoiceRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xServiceKey** | **string** | Service key for authentication | 

 **updateInvoiceRequest** | [**UpdateInvoiceRequest**](UpdateInvoiceRequest.md) |  | 

### Return type

[**CreateInvoice200Response**](CreateInvoice200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

