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
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## applyEnterpriseTemplate

> EnterpriseApplyResponse applyEnterpriseTemplate(applyEnterpriseTemplateRequest)

Apply enterprise template pricing

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
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


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


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **priceId** | `string` |  | [Defaults to `undefined`] |
| **calculatePriceCostRequest** | [CalculatePriceCostRequest](CalculatePriceCostRequest.md) |  | |

### Return type

[**CalculatePriceCostResponse**](CalculatePriceCostResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## convertStripeIDToConfigID

> ConvertStripeIDResponse convertStripeIDToConfigID(stripeId)

Convert Stripe ID to config ID

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
    // string
    stripeId: stripeId_example,
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
| **stripeId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**ConvertStripeIDResponse**](ConvertStripeIDResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getEnterprisePricesByID

> EnterprisePricesResponse getEnterprisePricesByID(enterpriseId)

Get enterprise prices by ID

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
    // string
    enterpriseId: enterpriseId_example,
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
| **enterpriseId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**EnterprisePricesResponse**](EnterprisePricesResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getEnterprisePricesByTemplate

> EnterprisePricesResponse getEnterprisePricesByTemplate(template)

Get enterprise prices by template

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
    // string
    template: template_example,
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
| **template** | `string` |  | [Defaults to `undefined`] |

### Return type

[**EnterprisePricesResponse**](EnterprisePricesResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getMeterByID

> GetMeterResponse getMeterByID(meterId)

Get meter by ID

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


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **meterId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**GetMeterResponse**](GetMeterResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPriceByID

> GetPriceResponse getPriceByID(priceId)

Get price by ID

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


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **priceId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**GetPriceResponse**](GetPriceResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProductByID

> GetProductResponse getProductByID(productId)

Get product by ID

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


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **productId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**GetProductResponse**](GetProductResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getStripeConfig

> StripeConfigResponse getStripeConfig()

Get public Stripe config

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
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getStripeConfigAdmin

> StripeConfigResponse getStripeConfigAdmin()

Get full Stripe config (admin)

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
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listWebhooks

> ListWebhooksResponse listWebhooks()

List all webhooks

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
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

