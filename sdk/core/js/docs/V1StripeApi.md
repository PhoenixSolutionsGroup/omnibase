# V1StripeApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**applyEnterpriseCustom**](V1StripeApi.md#applyenterprisecustomoperation) | **POST** /api/v1/stripe/admin/enterprise/apply-custom | Apply custom enterprise pricing |
| [**applyEnterpriseTemplate**](V1StripeApi.md#applyenterprisetemplateoperation) | **POST** /api/v1/stripe/admin/enterprise/apply-template | Apply enterprise template pricing |
| [**calculatePriceCost**](V1StripeApi.md#calculatepricecostoperation) | **POST** /api/v1/stripe/config/prices/{price_id}/calculate | Calculate cost for a price |
| [**convertStripeIDToConfigID**](V1StripeApi.md#convertstripeidtoconfigid) | **GET** /api/v1/stripe/convert/stripe-id/{stripe_id} | Convert Stripe ID to config ID |
| [**getEnterprisePricesByID**](V1StripeApi.md#getenterprisepricesbyid) | **GET** /api/v1/stripe/admin/enterprise/prices/by-id/{enterprise_id} | Get enterprise prices by ID |
| [**getEnterprisePricesByTemplate**](V1StripeApi.md#getenterprisepricesbytemplate) | **GET** /api/v1/stripe/admin/enterprise/prices/by-template/{template} | Get enterprise prices by template |
| [**getMeterByID**](V1StripeApi.md#getmeterbyid) | **GET** /api/v1/stripe/config/meters/{meter_id} | Get meter by ID |
| [**getPriceByID**](V1StripeApi.md#getpricebyid) | **GET** /api/v1/stripe/config/prices/{price_id} | Get price by ID |
| [**getProductByID**](V1StripeApi.md#getproductbyid) | **GET** /api/v1/stripe/config/products/{product_id} | Get product by ID |
| [**getStripeConfig**](V1StripeApi.md#getstripeconfig) | **GET** /api/v1/stripe/config | Get public Stripe config |
| [**getStripeConfigAdmin**](V1StripeApi.md#getstripeconfigadmin) | **GET** /api/v1/stripe/admin/config | Get full Stripe config (admin) |
| [**listWebhooks**](V1StripeApi.md#listwebhooks) | **GET** /api/v1/stripe/admin/webhooks | List all webhooks |



## applyEnterpriseCustom

> EnterpriseApplyResponse applyEnterpriseCustom(applyEnterpriseCustomRequest)

Apply custom enterprise pricing

Applies tenant-specific enterprise pricing to a tenant. This swaps the tenant\&#39;s active subscription prices to custom enterprise prices identified by enterprise_id.  ## Authentication Requires service key authentication.  ## Use Cases - Apply custom negotiated pricing for specific enterprise customers - Tenant-specific pricing overrides - Custom enterprise onboarding  ## Flow 1. Validates tenant exists and has Stripe customer ID 2. Fetches all prices with matching &#x60;enterprise_id&#x60; 3. Swaps subscription item prices to enterprise equivalents 4. Updates tenant\&#39;s &#x60;enterprise_id&#x60; field for future provisioning 

### Example

```ts
import {
  Configuration,
  V1StripeApi,
} from '@omnibase/core-js';
import type { ApplyEnterpriseCustomOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1StripeApi(config);

  const body = {
    // ApplyEnterpriseCustomRequest
    applyEnterpriseCustomRequest: ...,
  } satisfies ApplyEnterpriseCustomOperationRequest;

  try {
    const data = await api.applyEnterpriseCustom(body);
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
| **applyEnterpriseCustomRequest** | [ApplyEnterpriseCustomRequest](ApplyEnterpriseCustomRequest.md) |  | |

### Return type

[**EnterpriseApplyResponse**](EnterpriseApplyResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Custom enterprise pricing applied successfully |  -  |
| **400** | Invalid request or tenant has no Stripe customer ID |  -  |
| **401** | Invalid or missing service key |  -  |
| **404** | Tenant or enterprise_id not found |  -  |
| **500** | Failed to apply enterprise pricing |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## applyEnterpriseTemplate

> EnterpriseApplyResponse applyEnterpriseTemplate(applyEnterpriseTemplateRequest)

Apply enterprise template pricing

Applies template-based enterprise pricing to a tenant. This swaps the tenant\&#39;s active subscription prices to the corresponding enterprise template prices.  ## Authentication Requires service key authentication.  ## Use Cases - Apply pre-defined discount tiers to enterprise customers - Bulk pricing changes for enterprise accounts - Template-based enterprise onboarding  ## Flow 1. Validates tenant exists and has Stripe customer ID 2. Fetches all prices with matching &#x60;enterprise_template&#x60; 3. Swaps subscription item prices to enterprise equivalents 4. Updates tenant\&#39;s &#x60;enterprise_template&#x60; field for future provisioning 

### Example

```ts
import {
  Configuration,
  V1StripeApi,
} from '@omnibase/core-js';
import type { ApplyEnterpriseTemplateOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1StripeApi(config);

  const body = {
    // ApplyEnterpriseTemplateRequest
    applyEnterpriseTemplateRequest: ...,
  } satisfies ApplyEnterpriseTemplateOperationRequest;

  try {
    const data = await api.applyEnterpriseTemplate(body);
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
| **applyEnterpriseTemplateRequest** | [ApplyEnterpriseTemplateRequest](ApplyEnterpriseTemplateRequest.md) |  | |

### Return type

[**EnterpriseApplyResponse**](EnterpriseApplyResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Enterprise template pricing applied successfully |  -  |
| **400** | Invalid request or tenant has no Stripe customer ID |  -  |
| **401** | Invalid or missing service key |  -  |
| **404** | Tenant or enterprise template not found |  -  |
| **500** | Failed to apply enterprise pricing |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## calculatePriceCost

> CalculatePriceCostResponse calculatePriceCost(priceId, calculatePriceCostRequest)

Calculate cost for a price

Calculates the cost in cents for a given quantity of a price, handling both flat and tiered pricing.  ## Authentication No authentication required for public endpoint.  ## Pricing Modes - **per_unit**: Simple flat pricing where cost &#x3D; unit_amount × quantity - **tiered (graduated)**: Each tier\&#39;s price applies only to units in that tier (like tax brackets) - **tiered (volume)**: The applicable tier\&#39;s price applies to ALL units  ## Use Cases - Calculate estimated costs for usage preview - Display cost estimates in dashboard - Usage billing calculations 

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
    // string | Price config ID
    priceId: compute_hourly,
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


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **priceId** | `string` | Price config ID | [Defaults to `undefined`] |
| **calculatePriceCostRequest** | [CalculatePriceCostRequest](CalculatePriceCostRequest.md) |  | |

### Return type

[**CalculatePriceCostResponse**](CalculatePriceCostResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Cost calculated successfully |  -  |
| **400** | Invalid request or missing quantity |  -  |
| **404** | Price not found |  -  |
| **500** | Failed to calculate cost |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## convertStripeIDToConfigID

> StripeIDConversionResponse convertStripeIDToConfigID(stripeId)

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

[**StripeIDConversionResponse**](StripeIDConversionResponse.md)

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


## getEnterprisePricesByID

> EnterprisePricesResponse getEnterprisePricesByID(enterpriseId)

Get enterprise prices by ID

Retrieves prices filtered by enterprise ID.  ## Authentication Requires service key authentication.  ## Use Cases - View custom pricing for a specific enterprise - Provisioning services for enterprise tenants 

### Example

```ts
import {
  Configuration,
  V1StripeApi,
} from '@omnibase/core-js';
import type { GetEnterprisePricesByIDRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1StripeApi(config);

  const body = {
    // string | Enterprise ID to filter by
    enterpriseId: acme_corp,
  } satisfies GetEnterprisePricesByIDRequest;

  try {
    const data = await api.getEnterprisePricesByID(body);
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
| **enterpriseId** | `string` | Enterprise ID to filter by | [Defaults to `undefined`] |

### Return type

[**EnterprisePricesResponse**](EnterprisePricesResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Enterprise prices retrieved successfully |  -  |
| **401** | Invalid or missing service key |  -  |
| **500** | Failed to retrieve enterprise prices |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getEnterprisePricesByTemplate

> EnterprisePricesResponse getEnterprisePricesByTemplate(template)

Get enterprise prices by template

Retrieves prices filtered by enterprise template.  ## Authentication Requires service key authentication.  ## Use Cases - List available enterprise prices for a template - Provisioning services for enterprise tenants 

### Example

```ts
import {
  Configuration,
  V1StripeApi,
} from '@omnibase/core-js';
import type { GetEnterprisePricesByTemplateRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1StripeApi(config);

  const body = {
    // string | Enterprise template to filter by
    template: tier1_10pct_off,
  } satisfies GetEnterprisePricesByTemplateRequest;

  try {
    const data = await api.getEnterprisePricesByTemplate(body);
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
| **template** | `string` | Enterprise template to filter by | [Defaults to `undefined`] |

### Return type

[**EnterprisePricesResponse**](EnterprisePricesResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Enterprise prices retrieved successfully |  -  |
| **401** | Invalid or missing service key |  -  |
| **500** | Failed to retrieve enterprise prices |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getMeterByID

> MeterResponse getMeterByID(meterId)

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

[**MeterResponse**](MeterResponse.md)

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

> PriceResponse getPriceByID(priceId)

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

[**PriceResponse**](PriceResponse.md)

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

> ProductResponse getProductByID(productId)

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

[**ProductResponse**](ProductResponse.md)

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

> StripeConfigResponse getStripeConfig()

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

[**StripeConfigResponse**](StripeConfigResponse.md)

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

> StripeConfigResponse getStripeConfigAdmin()

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

[**StripeConfigResponse**](StripeConfigResponse.md)

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


## listWebhooks

> ListWebhooksResponse listWebhooks()

List all webhooks

Retrieves all configured webhook endpoints with their signing secrets.  ## Authentication Requires service key authentication.  ## Use Cases - List all webhook configurations - Retrieve signing secrets for webhook signature verification - Debug webhook configuration 

### Example

```ts
import {
  Configuration,
  V1StripeApi,
} from '@omnibase/core-js';
import type { ListWebhooksRequest } from '@omnibase/core-js';

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
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Webhooks retrieved successfully |  -  |
| **401** | Invalid or missing service key |  -  |
| **500** | Failed to retrieve webhooks |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

