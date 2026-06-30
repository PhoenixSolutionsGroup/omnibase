# \V1PaymentsAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**AddInvoiceLineItem**](V1PaymentsAPI.md#AddInvoiceLineItem) | **Post** /api/v1/payments/invoices/{invoice_id}/items | Add a line item to a Stripe invoice
[**AddInvoiceLineItemWithPriceId**](V1PaymentsAPI.md#AddInvoiceLineItemWithPriceId) | **Post** /api/v1/payments/invoices/{invoice_id}/items/price | Add a line item to a Stripe invoice using a price ID
[**CreateCheckout**](V1PaymentsAPI.md#CreateCheckout) | **Post** /api/v1/payments/checkout | Create a Stripe checkout session
[**CreateCustomerPortal**](V1PaymentsAPI.md#CreateCustomerPortal) | **Post** /api/v1/payments/portal | Create a Stripe customer portal session
[**CreateInvoice**](V1PaymentsAPI.md#CreateInvoice) | **Post** /api/v1/payments/invoices | Create a Stripe invoice
[**FinalizeInvoice**](V1PaymentsAPI.md#FinalizeInvoice) | **Post** /api/v1/payments/invoices/{invoice_id}/finalize | Finalize a Stripe invoice
[**GetInvoice**](V1PaymentsAPI.md#GetInvoice) | **Get** /api/v1/payments/invoices/{invoice_id} | Get a Stripe invoice
[**RecordUsage**](V1PaymentsAPI.md#RecordUsage) | **Post** /api/v1/payments/usage | Record a Stripe meter usage event
[**UpdateInvoice**](V1PaymentsAPI.md#UpdateInvoice) | **Patch** /api/v1/payments/invoices/{invoice_id} | Update a Stripe invoice



## AddInvoiceLineItem

> InvoiceLineItemResponse AddInvoiceLineItem(ctx, invoiceId).AddLineItemRequest(addLineItemRequest).Execute()

Add a line item to a Stripe invoice

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
	invoiceId := "invoiceId_example" // string | 
	addLineItemRequest := *openapiclient.NewAddLineItemRequest(int64(123), "Currency_example", "Description_example") // AddLineItemRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.AddInvoiceLineItem(context.Background(), invoiceId).AddLineItemRequest(addLineItemRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.AddInvoiceLineItem``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AddInvoiceLineItem`: InvoiceLineItemResponse
	fmt.Fprintf(os.Stdout, "Response from `V1PaymentsAPI.AddInvoiceLineItem`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**invoiceId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiAddInvoiceLineItemRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **addLineItemRequest** | [**AddLineItemRequest**](AddLineItemRequest.md) |  | 

### Return type

[**InvoiceLineItemResponse**](InvoiceLineItemResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## AddInvoiceLineItemWithPriceId

> InvoiceLineItemResponse AddInvoiceLineItemWithPriceId(ctx, invoiceId).AddLineItemByPriceRequest(addLineItemByPriceRequest).Execute()

Add a line item to a Stripe invoice using a price ID

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
	invoiceId := "invoiceId_example" // string | 
	addLineItemByPriceRequest := *openapiclient.NewAddLineItemByPriceRequest("Currency_example", "Description_example", int64(123)) // AddLineItemByPriceRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.AddInvoiceLineItemWithPriceId(context.Background(), invoiceId).AddLineItemByPriceRequest(addLineItemByPriceRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.AddInvoiceLineItemWithPriceId``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AddInvoiceLineItemWithPriceId`: InvoiceLineItemResponse
	fmt.Fprintf(os.Stdout, "Response from `V1PaymentsAPI.AddInvoiceLineItemWithPriceId`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**invoiceId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiAddInvoiceLineItemWithPriceIdRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **addLineItemByPriceRequest** | [**AddLineItemByPriceRequest**](AddLineItemByPriceRequest.md) |  | 

### Return type

[**InvoiceLineItemResponse**](InvoiceLineItemResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateCheckout

> CreateCheckoutResponse CreateCheckout(ctx).CreateCheckoutRequest(createCheckoutRequest).Execute()

Create a Stripe checkout session

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
	createCheckoutRequest := *openapiclient.NewCreateCheckoutRequest("CancelUrl_example", "PriceId_example", "SuccessUrl_example") // CreateCheckoutRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.CreateCheckout(context.Background()).CreateCheckoutRequest(createCheckoutRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.CreateCheckout``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateCheckout`: CreateCheckoutResponse
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

[**CreateCheckoutResponse**](CreateCheckoutResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateCustomerPortal

> CreatePortalResponse CreateCustomerPortal(ctx).CreatePortalRequest(createPortalRequest).Execute()

Create a Stripe customer portal session

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
	createPortalRequest := *openapiclient.NewCreatePortalRequest("ReturnUrl_example") // CreatePortalRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.CreateCustomerPortal(context.Background()).CreatePortalRequest(createPortalRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.CreateCustomerPortal``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateCustomerPortal`: CreatePortalResponse
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

[**CreatePortalResponse**](CreatePortalResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateInvoice

> InvoiceResponse CreateInvoice(ctx).CreateInvoiceRequest(createInvoiceRequest).Execute()

Create a Stripe invoice

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
	createInvoiceRequest := *openapiclient.NewCreateInvoiceRequest("Currency_example") // CreateInvoiceRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.CreateInvoice(context.Background()).CreateInvoiceRequest(createInvoiceRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.CreateInvoice``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateInvoice`: InvoiceResponse
	fmt.Fprintf(os.Stdout, "Response from `V1PaymentsAPI.CreateInvoice`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateInvoiceRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createInvoiceRequest** | [**CreateInvoiceRequest**](CreateInvoiceRequest.md) |  | 

### Return type

[**InvoiceResponse**](InvoiceResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## FinalizeInvoice

> InvoiceResponse FinalizeInvoice(ctx, invoiceId).FinalizeRequest(finalizeRequest).Execute()

Finalize a Stripe invoice

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
	invoiceId := "invoiceId_example" // string | 
	finalizeRequest := *openapiclient.NewFinalizeRequest() // FinalizeRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.FinalizeInvoice(context.Background(), invoiceId).FinalizeRequest(finalizeRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.FinalizeInvoice``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `FinalizeInvoice`: InvoiceResponse
	fmt.Fprintf(os.Stdout, "Response from `V1PaymentsAPI.FinalizeInvoice`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**invoiceId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiFinalizeInvoiceRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **finalizeRequest** | [**FinalizeRequest**](FinalizeRequest.md) |  | 

### Return type

[**InvoiceResponse**](InvoiceResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetInvoice

> InvoiceResponse GetInvoice(ctx, invoiceId).Execute()

Get a Stripe invoice

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
	invoiceId := "invoiceId_example" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.GetInvoice(context.Background(), invoiceId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.GetInvoice``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetInvoice`: InvoiceResponse
	fmt.Fprintf(os.Stdout, "Response from `V1PaymentsAPI.GetInvoice`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**invoiceId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetInvoiceRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**InvoiceResponse**](InvoiceResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## RecordUsage

> interface{} RecordUsage(ctx).RecordUsageRequest(recordUsageRequest).Execute()

Record a Stripe meter usage event

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
	recordUsageRequest := *openapiclient.NewRecordUsageRequest("MeterEventName_example", "Value_example") // RecordUsageRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.RecordUsage(context.Background()).RecordUsageRequest(recordUsageRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.RecordUsage``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `RecordUsage`: interface{}
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

**interface{}**

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## UpdateInvoice

> InvoiceResponse UpdateInvoice(ctx, invoiceId).UpdateInvoiceRequest(updateInvoiceRequest).Execute()

Update a Stripe invoice

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
	invoiceId := "invoiceId_example" // string | 
	updateInvoiceRequest := *openapiclient.NewUpdateInvoiceRequest() // UpdateInvoiceRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1PaymentsAPI.UpdateInvoice(context.Background(), invoiceId).UpdateInvoiceRequest(updateInvoiceRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1PaymentsAPI.UpdateInvoice``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `UpdateInvoice`: InvoiceResponse
	fmt.Fprintf(os.Stdout, "Response from `V1PaymentsAPI.UpdateInvoice`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**invoiceId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiUpdateInvoiceRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **updateInvoiceRequest** | [**UpdateInvoiceRequest**](UpdateInvoiceRequest.md) |  | 

### Return type

[**InvoiceResponse**](InvoiceResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

