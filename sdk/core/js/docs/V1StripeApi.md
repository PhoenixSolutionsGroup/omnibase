# V1StripeApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**convertStripeIDToConfigID**](V1StripeApi.md#convertstripeidtoconfigid) | **GET** /api/v1/stripe/convert/stripe-id/{stripe_id} | Convert Stripe ID to config ID |
| [**getMeterByID**](V1StripeApi.md#getmeterbyid) | **GET** /api/v1/stripe/config/meters/{meter_id} | Get meter by ID |
| [**getPriceByID**](V1StripeApi.md#getpricebyid) | **GET** /api/v1/stripe/config/prices/{price_id} | Get price by ID |
| [**getProductByID**](V1StripeApi.md#getproductbyid) | **GET** /api/v1/stripe/config/products/{product_id} | Get product by ID |
| [**getStripeConfig**](V1StripeApi.md#getstripeconfig) | **GET** /api/v1/stripe/config | Get public Stripe config |
| [**getStripeConfigAdmin**](V1StripeApi.md#getstripeconfigadmin) | **GET** /api/v1/stripe/admin/config | Get full Stripe config (admin) |



## convertStripeIDToConfigID

> ConvertStripeIDToConfigID200Response convertStripeIDToConfigID(stripeId)

Convert Stripe ID to config ID

Converts a Stripe ID (product, price, or meter) to the corresponding config ID.  ## Authentication No authentication required for public endpoint.  ## Use Cases - Webhook processing - Subscription mapping - Price lookups 

### Example

```ts
import {
  Configuration,
  V1StripeApi,
} from '@omnibase/core-js';
import type { ConvertStripeIDToConfigIDRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const api = new V1StripeApi();

  const body = {
    // string | Stripe ID to convert
    stripeId: price_1SRiyyCJIZaBlhY1NpAJFhNU,
  } satisfies ConvertStripeIDToConfigIDRequest;

  try {
    const data = await api.convertStripeIDToConfigID(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **stripeId** | `string` | Stripe ID to convert | [Defaults to `undefined`] |

### Return type

[**ConvertStripeIDToConfigID200Response**](ConvertStripeIDToConfigID200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Config ID found |  -  |
| **400** | Missing Stripe ID |  -  |
| **404** | Mapping not found |  -  |
| **500** | Failed to retrieve mapping |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getMeterByID

> GetMeterByID200Response getMeterByID(meterId)

Get meter by ID

Returns a specific billing meter from the Stripe configuration by its config ID.  ## Authentication No authentication required for public endpoint.  ## Use Cases - Fetch meter details for usage tracking - Display metered billing information - Usage reporting configuration 

### Example

```ts
import {
  Configuration,
  V1StripeApi,
} from '@omnibase/core-js';
import type { GetMeterByIDRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const api = new V1StripeApi();

  const body = {
    // string | Meter config ID
    meterId: api_requests,
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


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **meterId** | `string` | Meter config ID | [Defaults to `undefined`] |

### Return type

[**GetMeterByID200Response**](GetMeterByID200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Meter found |  -  |
| **400** | Missing meter_id |  -  |
| **404** | Meter not found |  -  |
| **500** | Failed to retrieve meter |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPriceByID

> GetPriceByID200Response getPriceByID(priceId)

Get price by ID

Returns a specific price from the Stripe configuration by its config ID, along with its parent product.  ## Authentication No authentication required for public endpoint.  ## Use Cases - Fetch price details for checkout - Display specific pricing information - Subscription management 

### Example

```ts
import {
  Configuration,
  V1StripeApi,
} from '@omnibase/core-js';
import type { GetPriceByIDRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const api = new V1StripeApi();

  const body = {
    // string | Price config ID
    priceId: basic_monthly,
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


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **priceId** | `string` | Price config ID | [Defaults to `undefined`] |

### Return type

[**GetPriceByID200Response**](GetPriceByID200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Price found |  -  |
| **400** | Missing price_id |  -  |
| **404** | Price not found |  -  |
| **500** | Failed to retrieve price |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProductByID

> GetProductByID200Response getProductByID(productId)

Get product by ID

Returns a specific product from the Stripe configuration by its config ID, including all its prices.  ## Authentication No authentication required for public endpoint.  ## Use Cases - Fetch product details - Display product information with all price options - Product catalog pages 

### Example

```ts
import {
  Configuration,
  V1StripeApi,
} from '@omnibase/core-js';
import type { GetProductByIDRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const api = new V1StripeApi();

  const body = {
    // string | Product config ID
    productId: basic_plan,
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


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **productId** | `string` | Product config ID | [Defaults to `undefined`] |

### Return type

[**GetProductByID200Response**](GetProductByID200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Product found |  -  |
| **400** | Missing product_id |  -  |
| **404** | Product not found |  -  |
| **500** | Failed to retrieve product |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getStripeConfig

> GetStripeConfig200Response getStripeConfig()

Get public Stripe config

Returns the current Stripe configuration with public prices only (filters out enterprise prices).  ## Authentication No authentication required for public endpoint.  ## Use Cases - Display pricing to users - Build subscription selection UI - Public pricing pages 

### Example

```ts
import {
  Configuration,
  V1StripeApi,
} from '@omnibase/core-js';
import type { GetStripeConfigRequest } from '@omnibase/core-js';

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

[**GetStripeConfig200Response**](GetStripeConfig200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Stripe configuration retrieved successfully |  -  |
| **500** | Failed to retrieve configuration |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getStripeConfigAdmin

> GetStripeConfig200Response getStripeConfigAdmin()

Get full Stripe config (admin)

Returns the complete Stripe configuration including all prices (both public and enterprise).  ## Authentication Requires admin JWT token.  ## Use Cases - Admin configuration management - Enterprise pricing display - Configuration auditing 

### Example

```ts
import {
  Configuration,
  V1StripeApi,
} from '@omnibase/core-js';
import type { GetStripeConfigAdminRequest } from '@omnibase/core-js';

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

[**GetStripeConfig200Response**](GetStripeConfig200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Full Stripe configuration retrieved successfully |  -  |
| **401** | Invalid or missing admin token |  -  |
| **500** | Failed to retrieve configuration |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

