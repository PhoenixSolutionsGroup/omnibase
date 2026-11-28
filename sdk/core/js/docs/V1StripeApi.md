# V1StripeApi

All URIs are relative to _https://api.omnibase.tech_

| Method                                                               | HTTP request                                               | Description                    |
| -------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------ |
| [**calculatePriceCost**](V1StripeApi.md#calculatepricecostoperation) | **POST** /api/v1/stripe/config/prices/{price_id}/calculate | Calculate cost for a price     |
| [**getMeterByID**](V1StripeApi.md#getmeterbyid)                      | **GET** /api/v1/stripe/config/meters/{meter_id}            | Get meter by ID                |
| [**getPriceByID**](V1StripeApi.md#getpricebyid)                      | **GET** /api/v1/stripe/config/prices/{price_id}            | Get price by ID                |
| [**getProductByID**](V1StripeApi.md#getproductbyid)                  | **GET** /api/v1/stripe/config/products/{product_id}        | Get product by ID              |
| [**getStripeConfig**](V1StripeApi.md#getstripeconfig)                | **GET** /api/v1/stripe/config                              | Get public Stripe config       |
| [**getStripeConfigAdmin**](V1StripeApi.md#getstripeconfigadmin)      | **GET** /api/v1/stripe/admin/config                        | Get full Stripe config (admin) |
| [**listWebhooks**](V1StripeApi.md#listwebhooks)                      | **GET** /api/v1/stripe/admin/webhooks                      | List all webhooks              |

## calculatePriceCost

> CalculatePriceCostResponse calculatePriceCost(priceId, calculatePriceCostRequest)

Calculate cost for a price

### Example

```ts
import {
  Configuration,
  V1StripeApi,
} from '@omnibase/core-js';
import type { CalculatePriceCostOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const api = new V1StripeApi();

  const body = {
    // string
    priceId: priceId_example,
    // CalculatePriceCostRequest
    calculatePriceCostRequest: ...,
  } satisfies CalculatePriceCostOperationRequest;

  try {
    const data = await api.calculatePriceCost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                          | Type                                                      | Description | Notes                     |
| ----------------------------- | --------------------------------------------------------- | ----------- | ------------------------- |
| **priceId**                   | `string`                                                  |             | [Defaults to `undefined`] |
| **calculatePriceCostRequest** | [CalculatePriceCostRequest](CalculatePriceCostRequest.md) |             |                           |

### Return type

[**CalculatePriceCostResponse**](CalculatePriceCostResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`

### HTTP response details

| Status code | Description           | Response headers |
| ----------- | --------------------- | ---------------- |
| **200**     | OK                    | -                |
| **400**     | Bad Request           | -                |
| **404**     | Not Found             | -                |
| **422**     | Unprocessable Entity  | -                |
| **500**     | Internal Server Error | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getMeterByID

> GetMeterResponse getMeterByID(meterId)

Get meter by ID

### Example

```ts
import { Configuration, V1StripeApi } from "@omnibase/core-js";
import type { GetMeterByIDRequest } from "@omnibase/core-js";

async function example() {
	console.log("🚀 Testing @omnibase/core-js SDK...");
	const api = new V1StripeApi();

	const body = {
		// string
		meterId: meterId_example,
	} satisfies GetMeterByIDRequest;

	try {
		const data = await api.getMeterByID(body);
		console.log(data);
	} catch (error) {
		console.error(error);
	}
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name        | Type     | Description | Notes                     |
| ----------- | -------- | ----------- | ------------------------- |
| **meterId** | `string` |             | [Defaults to `undefined`] |

### Return type

[**GetMeterResponse**](GetMeterResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`

### HTTP response details

| Status code | Description           | Response headers |
| ----------- | --------------------- | ---------------- |
| **200**     | OK                    | -                |
| **400**     | Bad Request           | -                |
| **404**     | Not Found             | -                |
| **422**     | Unprocessable Entity  | -                |
| **500**     | Internal Server Error | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getPriceByID

> GetPriceResponse getPriceByID(priceId)

Get price by ID

### Example

```ts
import { Configuration, V1StripeApi } from "@omnibase/core-js";
import type { GetPriceByIDRequest } from "@omnibase/core-js";

async function example() {
	console.log("🚀 Testing @omnibase/core-js SDK...");
	const api = new V1StripeApi();

	const body = {
		// string
		priceId: priceId_example,
	} satisfies GetPriceByIDRequest;

	try {
		const data = await api.getPriceByID(body);
		console.log(data);
	} catch (error) {
		console.error(error);
	}
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name        | Type     | Description | Notes                     |
| ----------- | -------- | ----------- | ------------------------- |
| **priceId** | `string` |             | [Defaults to `undefined`] |

### Return type

[**GetPriceResponse**](GetPriceResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`

### HTTP response details

| Status code | Description           | Response headers |
| ----------- | --------------------- | ---------------- |
| **200**     | OK                    | -                |
| **400**     | Bad Request           | -                |
| **404**     | Not Found             | -                |
| **422**     | Unprocessable Entity  | -                |
| **500**     | Internal Server Error | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getProductByID

> GetProductResponse getProductByID(productId)

Get product by ID

### Example

```ts
import { Configuration, V1StripeApi } from "@omnibase/core-js";
import type { GetProductByIDRequest } from "@omnibase/core-js";

async function example() {
	console.log("🚀 Testing @omnibase/core-js SDK...");
	const api = new V1StripeApi();

	const body = {
		// string
		productId: productId_example,
	} satisfies GetProductByIDRequest;

	try {
		const data = await api.getProductByID(body);
		console.log(data);
	} catch (error) {
		console.error(error);
	}
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name          | Type     | Description | Notes                     |
| ------------- | -------- | ----------- | ------------------------- |
| **productId** | `string` |             | [Defaults to `undefined`] |

### Return type

[**GetProductResponse**](GetProductResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`

### HTTP response details

| Status code | Description           | Response headers |
| ----------- | --------------------- | ---------------- |
| **200**     | OK                    | -                |
| **400**     | Bad Request           | -                |
| **404**     | Not Found             | -                |
| **422**     | Unprocessable Entity  | -                |
| **500**     | Internal Server Error | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getStripeConfig

> StripeConfigResponse getStripeConfig()

Get public Stripe config

### Example

```ts
import { Configuration, V1StripeApi } from "@omnibase/core-js";
import type { GetStripeConfigRequest } from "@omnibase/core-js";

async function example() {
	console.log("🚀 Testing @omnibase/core-js SDK...");
	const api = new V1StripeApi();

	try {
		const data = await api.getStripeConfig();
		console.log(data);
	} catch (error) {
		console.error(error);
	}
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**StripeConfigResponse**](StripeConfigResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`

### HTTP response details

| Status code | Description           | Response headers |
| ----------- | --------------------- | ---------------- |
| **200**     | OK                    | -                |
| **500**     | Internal Server Error | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getStripeConfigAdmin

> StripeConfigResponse getStripeConfigAdmin()

Get full Stripe config (admin)

### Example

```ts
import { Configuration, V1StripeApi } from "@omnibase/core-js";
import type { GetStripeConfigAdminRequest } from "@omnibase/core-js";

async function example() {
	console.log("🚀 Testing @omnibase/core-js SDK...");
	const config = new Configuration({
		// To configure API key authorization: ServiceKeyAuth
		apiKey: "YOUR API KEY",
	});
	const api = new V1StripeApi(config);

	try {
		const data = await api.getStripeConfigAdmin();
		console.log(data);
	} catch (error) {
		console.error(error);
	}
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**StripeConfigResponse**](StripeConfigResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`

### HTTP response details

| Status code | Description           | Response headers |
| ----------- | --------------------- | ---------------- |
| **200**     | OK                    | -                |
| **400**     | Bad Request           | -                |
| **401**     | Unauthorized          | -                |
| **500**     | Internal Server Error | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## listWebhooks

> ListWebhooksResponse listWebhooks()

List all webhooks

### Example

```ts
import { Configuration, V1StripeApi } from "@omnibase/core-js";
import type { ListWebhooksRequest } from "@omnibase/core-js";

async function example() {
	console.log("🚀 Testing @omnibase/core-js SDK...");
	const config = new Configuration({
		// To configure API key authorization: ServiceKeyAuth
		apiKey: "YOUR API KEY",
	});
	const api = new V1StripeApi(config);

	try {
		const data = await api.listWebhooks();
		console.log(data);
	} catch (error) {
		console.error(error);
	}
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**ListWebhooksResponse**](ListWebhooksResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`

### HTTP response details

| Status code | Description           | Response headers |
| ----------- | --------------------- | ---------------- |
| **200**     | OK                    | -                |
| **400**     | Bad Request           | -                |
| **401**     | Unauthorized          | -                |
| **500**     | Internal Server Error | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
