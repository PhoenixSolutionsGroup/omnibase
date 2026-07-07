# V1TenantsSubscriptionsApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**addSubscription**](V1TenantsSubscriptionsApi.md#addsubscription) | **POST** /api/v1/tenants/subscriptions | Add a subscription to the tenant |
| [**getTenantBillingStatus**](V1TenantsSubscriptionsApi.md#gettenantbillingstatus) | **GET** /api/v1/tenants/billing-status | Get tenant billing status |
| [**getTenantSubscription**](V1TenantsSubscriptionsApi.md#gettenantsubscription) | **GET** /api/v1/tenants/subscriptions/{config_price_id} | Get a single tenant subscription |
| [**listTenantSubscriptions**](V1TenantsSubscriptionsApi.md#listtenantsubscriptions) | **GET** /api/v1/tenants/subscriptions | List subscriptions for the tenant |
| [**removeSubscription**](V1TenantsSubscriptionsApi.md#removesubscription) | **DELETE** /api/v1/tenants/subscriptions | Remove a subscription from the tenant |



## addSubscription

> AddResponse addSubscription(addRequest)

Add a subscription to the tenant

### Example

```ts
import {
  Configuration,
  V1TenantsSubscriptionsApi,
} from '@omnibase/core-js';
import type { AddSubscriptionRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsSubscriptionsApi(config);

  const body = {
    // AddRequest
    addRequest: ...,
  } satisfies AddSubscriptionRequest;

  try {
    const data = await api.addSubscription(body);
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
| **addRequest** | [AddRequest](AddRequest.md) |  | |

### Return type

[**AddResponse**](AddResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getTenantBillingStatus

> BillingStatusResponse getTenantBillingStatus()

Get tenant billing status

### Example

```ts
import {
  Configuration,
  V1TenantsSubscriptionsApi,
} from '@omnibase/core-js';
import type { GetTenantBillingStatusRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsSubscriptionsApi(config);

  try {
    const data = await api.getTenantBillingStatus();
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

[**BillingStatusResponse**](BillingStatusResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getTenantSubscription

> SubscriptionResponse getTenantSubscription(configPriceId)

Get a single tenant subscription

### Example

```ts
import {
  Configuration,
  V1TenantsSubscriptionsApi,
} from '@omnibase/core-js';
import type { GetTenantSubscriptionRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsSubscriptionsApi(config);

  const body = {
    // string
    configPriceId: configPriceId_example,
  } satisfies GetTenantSubscriptionRequest;

  try {
    const data = await api.getTenantSubscription(body);
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
| **configPriceId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**SubscriptionResponse**](SubscriptionResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listTenantSubscriptions

> Array&lt;SubscriptionResponse&gt; listTenantSubscriptions()

List subscriptions for the tenant

### Example

```ts
import {
  Configuration,
  V1TenantsSubscriptionsApi,
} from '@omnibase/core-js';
import type { ListTenantSubscriptionsRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsSubscriptionsApi(config);

  try {
    const data = await api.listTenantSubscriptions();
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

[**Array&lt;SubscriptionResponse&gt;**](SubscriptionResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeSubscription

> RemoveResponse removeSubscription(removeRequest)

Remove a subscription from the tenant

### Example

```ts
import {
  Configuration,
  V1TenantsSubscriptionsApi,
} from '@omnibase/core-js';
import type { RemoveSubscriptionRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsSubscriptionsApi(config);

  const body = {
    // RemoveRequest
    removeRequest: ...,
  } satisfies RemoveSubscriptionRequest;

  try {
    const data = await api.removeSubscription(body);
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
| **removeRequest** | [RemoveRequest](RemoveRequest.md) |  | |

### Return type

[**RemoveResponse**](RemoveResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

