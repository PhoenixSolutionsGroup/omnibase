# \V1StripeAPI

All URIs are relative to _https://api.omnibase.tech_

| Method                                                          | HTTP request                                               | Description                    |
| --------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------ |
| [**CalculatePriceCost**](V1StripeAPI.md#CalculatePriceCost)     | **Post** /api/v1/stripe/config/prices/{price_id}/calculate | Calculate cost for a price     |
| [**GetMeterByID**](V1StripeAPI.md#GetMeterByID)                 | **Get** /api/v1/stripe/config/meters/{meter_id}            | Get meter by ID                |
| [**GetPriceByID**](V1StripeAPI.md#GetPriceByID)                 | **Get** /api/v1/stripe/config/prices/{price_id}            | Get price by ID                |
| [**GetProductByID**](V1StripeAPI.md#GetProductByID)             | **Get** /api/v1/stripe/config/products/{product_id}        | Get product by ID              |
| [**GetStripeConfig**](V1StripeAPI.md#GetStripeConfig)           | **Get** /api/v1/stripe/config                              | Get public Stripe config       |
| [**GetStripeConfigAdmin**](V1StripeAPI.md#GetStripeConfigAdmin) | **Get** /api/v1/stripe/admin/config                        | Get full Stripe config (admin) |
| [**ListWebhooks**](V1StripeAPI.md#ListWebhooks)                 | **Get** /api/v1/stripe/admin/webhooks                      | List all webhooks              |

## CalculatePriceCost

> CalculatePriceCostResponse CalculatePriceCost(ctx, priceId).CalculatePriceCostRequest(calculatePriceCostRequest).Execute()

Calculate cost for a price

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
	priceId := "priceId_example" // string | 
	calculatePriceCostRequest := *openapiclient.NewCalculatePriceCostRequest(int64(123)) // CalculatePriceCostRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StripeAPI.CalculatePriceCost(context.Background(), priceId).CalculatePriceCostRequest(calculatePriceCostRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.CalculatePriceCost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CalculatePriceCost`: CalculatePriceCostResponse
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.CalculatePriceCost`: %v\n", resp)
}
```

### Path Parameters

| Name        | Type                | Description                                                                 | Notes |
| ----------- | ------------------- | --------------------------------------------------------------------------- | ----- |
| **ctx**     | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc. |
| **priceId** | **string**          |                                                                             |

### Other Parameters

Other parameters are passed through a pointer to a apiCalculatePriceCostRequest struct via the builder pattern

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |

**calculatePriceCostRequest** | [**CalculatePriceCostRequest**](CalculatePriceCostRequest.md) | |

### Return type

[**CalculatePriceCostResponse**](CalculatePriceCostResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

## GetMeterByID

> GetMeterResponse GetMeterByID(ctx, meterId).Execute()

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
	meterId := "meterId_example" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StripeAPI.GetMeterByID(context.Background(), meterId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.GetMeterByID``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetMeterByID`: GetMeterResponse
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.GetMeterByID`: %v\n", resp)
}
```

### Path Parameters

| Name        | Type                | Description                                                                 | Notes |
| ----------- | ------------------- | --------------------------------------------------------------------------- | ----- |
| **ctx**     | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc. |
| **meterId** | **string**          |                                                                             |

### Other Parameters

Other parameters are passed through a pointer to a apiGetMeterByIDRequest struct via the builder pattern

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |

### Return type

[**GetMeterResponse**](GetMeterResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

## GetPriceByID

> GetPriceResponse GetPriceByID(ctx, priceId).Execute()

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
	priceId := "priceId_example" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StripeAPI.GetPriceByID(context.Background(), priceId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.GetPriceByID``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetPriceByID`: GetPriceResponse
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.GetPriceByID`: %v\n", resp)
}
```

### Path Parameters

| Name        | Type                | Description                                                                 | Notes |
| ----------- | ------------------- | --------------------------------------------------------------------------- | ----- |
| **ctx**     | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc. |
| **priceId** | **string**          |                                                                             |

### Other Parameters

Other parameters are passed through a pointer to a apiGetPriceByIDRequest struct via the builder pattern

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |

### Return type

[**GetPriceResponse**](GetPriceResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

## GetProductByID

> GetProductResponse GetProductByID(ctx, productId).Execute()

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
	productId := "productId_example" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StripeAPI.GetProductByID(context.Background(), productId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.GetProductByID``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetProductByID`: GetProductResponse
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.GetProductByID`: %v\n", resp)
}
```

### Path Parameters

| Name          | Type                | Description                                                                 | Notes |
| ------------- | ------------------- | --------------------------------------------------------------------------- | ----- |
| **ctx**       | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc. |
| **productId** | **string**          |                                                                             |

### Other Parameters

Other parameters are passed through a pointer to a apiGetProductByIDRequest struct via the builder pattern

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |

### Return type

[**GetProductResponse**](GetProductResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

## GetStripeConfig

> StripeConfigResponse GetStripeConfig(ctx).Execute()

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
	// response from `GetStripeConfig`: StripeConfigResponse
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.GetStripeConfig`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetStripeConfigRequest struct via the builder pattern

### Return type

[**StripeConfigResponse**](StripeConfigResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

## GetStripeConfigAdmin

> StripeConfigResponse GetStripeConfigAdmin(ctx).Execute()

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
	// response from `GetStripeConfigAdmin`: StripeConfigResponse
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.GetStripeConfigAdmin`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetStripeConfigAdminRequest struct via the builder pattern

### Return type

[**StripeConfigResponse**](StripeConfigResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

## ListWebhooks

> ListWebhooksResponse ListWebhooks(ctx).Execute()

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
	// response from `ListWebhooks`: ListWebhooksResponse
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.ListWebhooks`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiListWebhooksRequest struct via the builder pattern

### Return type

[**ListWebhooksResponse**](ListWebhooksResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)
