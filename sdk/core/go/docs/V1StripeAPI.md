# \V1StripeAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ApplyEnterpriseCustom**](V1StripeAPI.md#ApplyEnterpriseCustom) | **Post** /api/v1/stripe/admin/enterprise/apply-custom | Apply custom enterprise pricing
[**ApplyEnterpriseTemplate**](V1StripeAPI.md#ApplyEnterpriseTemplate) | **Post** /api/v1/stripe/admin/enterprise/apply-template | Apply enterprise template pricing
[**ConvertStripeIDToConfigID**](V1StripeAPI.md#ConvertStripeIDToConfigID) | **Get** /api/v1/stripe/convert/stripe-id/{stripe_id} | Convert Stripe ID to config ID
[**GetEnterprisePricesByID**](V1StripeAPI.md#GetEnterprisePricesByID) | **Get** /api/v1/stripe/admin/enterprise/prices/by-id/{enterprise_id} | Get enterprise prices by ID
[**GetEnterprisePricesByTemplate**](V1StripeAPI.md#GetEnterprisePricesByTemplate) | **Get** /api/v1/stripe/admin/enterprise/prices/by-template/{template} | Get enterprise prices by template
[**GetMeterByID**](V1StripeAPI.md#GetMeterByID) | **Get** /api/v1/stripe/config/meters/{meter_id} | Get meter by ID
[**GetPriceByID**](V1StripeAPI.md#GetPriceByID) | **Get** /api/v1/stripe/config/prices/{price_id} | Get price by ID
[**GetProductByID**](V1StripeAPI.md#GetProductByID) | **Get** /api/v1/stripe/config/products/{product_id} | Get product by ID
[**GetStripeConfig**](V1StripeAPI.md#GetStripeConfig) | **Get** /api/v1/stripe/config | Get public Stripe config
[**GetStripeConfigAdmin**](V1StripeAPI.md#GetStripeConfigAdmin) | **Get** /api/v1/stripe/admin/config | Get full Stripe config (admin)
[**ListWebhooks**](V1StripeAPI.md#ListWebhooks) | **Get** /api/v1/stripe/admin/webhooks | List all webhooks



## ApplyEnterpriseCustom

> ApplyEnterpriseTemplate200Response ApplyEnterpriseCustom(ctx).ApplyEnterpriseCustomRequest(applyEnterpriseCustomRequest).Execute()

Apply custom enterprise pricing



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
	applyEnterpriseCustomRequest := *openapiclient.NewApplyEnterpriseCustomRequest("7d5da463-8351-4abe-870c-8ccdefc4d78c", "acme_corp") // ApplyEnterpriseCustomRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StripeAPI.ApplyEnterpriseCustom(context.Background()).ApplyEnterpriseCustomRequest(applyEnterpriseCustomRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.ApplyEnterpriseCustom``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ApplyEnterpriseCustom`: ApplyEnterpriseTemplate200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.ApplyEnterpriseCustom`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiApplyEnterpriseCustomRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **applyEnterpriseCustomRequest** | [**ApplyEnterpriseCustomRequest**](ApplyEnterpriseCustomRequest.md) |  | 

### Return type

[**ApplyEnterpriseTemplate200Response**](ApplyEnterpriseTemplate200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ApplyEnterpriseTemplate

> ApplyEnterpriseTemplate200Response ApplyEnterpriseTemplate(ctx).ApplyEnterpriseTemplateRequest(applyEnterpriseTemplateRequest).Execute()

Apply enterprise template pricing



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
	applyEnterpriseTemplateRequest := *openapiclient.NewApplyEnterpriseTemplateRequest("7d5da463-8351-4abe-870c-8ccdefc4d78c", "tier1_10pct_off") // ApplyEnterpriseTemplateRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StripeAPI.ApplyEnterpriseTemplate(context.Background()).ApplyEnterpriseTemplateRequest(applyEnterpriseTemplateRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.ApplyEnterpriseTemplate``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ApplyEnterpriseTemplate`: ApplyEnterpriseTemplate200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.ApplyEnterpriseTemplate`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiApplyEnterpriseTemplateRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **applyEnterpriseTemplateRequest** | [**ApplyEnterpriseTemplateRequest**](ApplyEnterpriseTemplateRequest.md) |  | 

### Return type

[**ApplyEnterpriseTemplate200Response**](ApplyEnterpriseTemplate200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


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


## GetEnterprisePricesByID

> GetEnterprisePricesByTemplate200Response GetEnterprisePricesByID(ctx, enterpriseId).Execute()

Get enterprise prices by ID



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
	enterpriseId := "acme_corp" // string | Enterprise ID to filter by

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StripeAPI.GetEnterprisePricesByID(context.Background(), enterpriseId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.GetEnterprisePricesByID``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetEnterprisePricesByID`: GetEnterprisePricesByTemplate200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.GetEnterprisePricesByID`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**enterpriseId** | **string** | Enterprise ID to filter by | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetEnterprisePricesByIDRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**GetEnterprisePricesByTemplate200Response**](GetEnterprisePricesByTemplate200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetEnterprisePricesByTemplate

> GetEnterprisePricesByTemplate200Response GetEnterprisePricesByTemplate(ctx, template).Execute()

Get enterprise prices by template



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
	template := "tier1_10pct_off" // string | Enterprise template to filter by

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StripeAPI.GetEnterprisePricesByTemplate(context.Background(), template).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.GetEnterprisePricesByTemplate``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetEnterprisePricesByTemplate`: GetEnterprisePricesByTemplate200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.GetEnterprisePricesByTemplate`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**template** | **string** | Enterprise template to filter by | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetEnterprisePricesByTemplateRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**GetEnterprisePricesByTemplate200Response**](GetEnterprisePricesByTemplate200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetMeterByID

> GetMeterByID200Response GetMeterByID(ctx, meterId).Execute()

Get meter by ID



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
	meterId := "api_requests" // string | Meter config ID

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StripeAPI.GetMeterByID(context.Background(), meterId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.GetMeterByID``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetMeterByID`: GetMeterByID200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.GetMeterByID`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**meterId** | **string** | Meter config ID | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetMeterByIDRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**GetMeterByID200Response**](GetMeterByID200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetPriceByID

> GetPriceByID200Response GetPriceByID(ctx, priceId).Execute()

Get price by ID



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
	priceId := "basic_monthly" // string | Price config ID

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StripeAPI.GetPriceByID(context.Background(), priceId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.GetPriceByID``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetPriceByID`: GetPriceByID200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.GetPriceByID`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**priceId** | **string** | Price config ID | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetPriceByIDRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**GetPriceByID200Response**](GetPriceByID200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetProductByID

> GetProductByID200Response GetProductByID(ctx, productId).Execute()

Get product by ID



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
	productId := "basic_plan" // string | Product config ID

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StripeAPI.GetProductByID(context.Background(), productId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.GetProductByID``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetProductByID`: GetProductByID200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.GetProductByID`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**productId** | **string** | Product config ID | 

### Other Parameters

Other parameters are passed through a pointer to a apiGetProductByIDRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**GetProductByID200Response**](GetProductByID200Response.md)

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


## ListWebhooks

> ListWebhooks200Response ListWebhooks(ctx).Execute()

List all webhooks



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
	resp, r, err := apiClient.V1StripeAPI.ListWebhooks(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.ListWebhooks``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListWebhooks`: ListWebhooks200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.ListWebhooks`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiListWebhooksRequest struct via the builder pattern


### Return type

[**ListWebhooks200Response**](ListWebhooks200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

