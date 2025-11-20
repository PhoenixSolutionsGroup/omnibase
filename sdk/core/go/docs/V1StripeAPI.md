# \V1StripeAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ConvertStripeIDToConfigID**](V1StripeAPI.md#ConvertStripeIDToConfigID) | **Get** /api/v1/stripe/convert/stripe-id/{stripe_id} | Convert Stripe ID to config ID
[**GetStripeConfig**](V1StripeAPI.md#GetStripeConfig) | **Get** /api/v1/stripe/config | Get public Stripe config
[**GetStripeConfigAdmin**](V1StripeAPI.md#GetStripeConfigAdmin) | **Get** /api/v1/stripe/admin/config | Get full Stripe config (admin)



## ConvertStripeIDToConfigID

> ConvertStripeIDToConfigID200Response ConvertStripeIDToConfigID(ctx, stripeId).Execute()

Convert Stripe ID to config ID



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
	stripeId := "price_1SRiyyCJIZaBlhY1NpAJFhNU" // string | Stripe ID to convert

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StripeAPI.ConvertStripeIDToConfigID(context.Background(), stripeId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.ConvertStripeIDToConfigID``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ConvertStripeIDToConfigID`: ConvertStripeIDToConfigID200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.ConvertStripeIDToConfigID`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**stripeId** | **string** | Stripe ID to convert | 

### Other Parameters

Other parameters are passed through a pointer to a apiConvertStripeIDToConfigIDRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**ConvertStripeIDToConfigID200Response**](ConvertStripeIDToConfigID200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetStripeConfig

> GetStripeConfig200Response GetStripeConfig(ctx).Execute()

Get public Stripe config



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
	resp, r, err := apiClient.V1StripeAPI.GetStripeConfig(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.GetStripeConfig``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetStripeConfig`: GetStripeConfig200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.GetStripeConfig`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetStripeConfigRequest struct via the builder pattern


### Return type

[**GetStripeConfig200Response**](GetStripeConfig200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetStripeConfigAdmin

> GetStripeConfig200Response GetStripeConfigAdmin(ctx).Execute()

Get full Stripe config (admin)



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
	resp, r, err := apiClient.V1StripeAPI.GetStripeConfigAdmin(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.GetStripeConfigAdmin``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetStripeConfigAdmin`: GetStripeConfig200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.GetStripeConfigAdmin`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetStripeConfigAdminRequest struct via the builder pattern


### Return type

[**GetStripeConfig200Response**](GetStripeConfig200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

