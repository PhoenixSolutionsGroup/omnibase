# V1StripeApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**convertStripeIDToConfigID**](V1StripeApi.md#convertstripeidtoconfigid) | **GET** /api/v1/stripe/convert/stripe-id/{stripe_id} | Convert Stripe ID to config ID |
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

