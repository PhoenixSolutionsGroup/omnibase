# V1TenantsLifecycleApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createTenant**](V1TenantsLifecycleApi.md#createtenantoperation) | **POST** /api/v1/tenants | Create a tenant |
| [**deleteTenant**](V1TenantsLifecycleApi.md#deletetenant) | **DELETE** /api/v1/tenants | Delete the current tenant |
| [**getTenantByID**](V1TenantsLifecycleApi.md#gettenantbyid) | **GET** /api/v1/tenants/by-id/{tenant_id} | Get tenant by ID |
| [**getTenantByStripeCustomerID**](V1TenantsLifecycleApi.md#gettenantbystripecustomerid) | **GET** /api/v1/tenants/by-stripe-customer/{stripe_customer_id} | Get tenant by Stripe customer ID |
| [**getTenantJWT**](V1TenantsLifecycleApi.md#gettenantjwt) | **GET** /api/v1/tenants/jwt | Get JWT for the current tenant |
| [**switchActiveTenant**](V1TenantsLifecycleApi.md#switchactivetenant) | **PUT** /api/v1/tenants/switch-active | Switch the active tenant |



## createTenant

> CreateTenantResponse createTenant(createTenantRequest)

Create a tenant

### Example

```ts
import {
  Configuration,
  V1TenantsLifecycleApi,
} from '@omnibase/core-js';
import type { CreateTenantOperationRequest } from '@omnibase/core-js';

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
  const api = new V1TenantsLifecycleApi(config);

  const body = {
    // CreateTenantRequest
    createTenantRequest: ...,
  } satisfies CreateTenantOperationRequest;

  try {
    const data = await api.createTenant(body);
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
| **createTenantRequest** | [CreateTenantRequest](CreateTenantRequest.md) |  | |

### Return type

[**CreateTenantResponse**](CreateTenantResponse.md)

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


## deleteTenant

> DeleteTenantResponse deleteTenant()

Delete the current tenant

### Example

```ts
import {
  Configuration,
  V1TenantsLifecycleApi,
} from '@omnibase/core-js';
import type { DeleteTenantRequest } from '@omnibase/core-js';

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
  const api = new V1TenantsLifecycleApi(config);

  try {
    const data = await api.deleteTenant();
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

[**DeleteTenantResponse**](DeleteTenantResponse.md)

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


## getTenantByID

> GetTenantByIDRow getTenantByID(tenantId)

Get tenant by ID

### Example

```ts
import {
  Configuration,
  V1TenantsLifecycleApi,
} from '@omnibase/core-js';
import type { GetTenantByIDRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsLifecycleApi(config);

  const body = {
    // string
    tenantId: tenantId_example,
  } satisfies GetTenantByIDRequest;

  try {
    const data = await api.getTenantByID(body);
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
| **tenantId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**GetTenantByIDRow**](GetTenantByIDRow.md)

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


## getTenantByStripeCustomerID

> GetTenantByStripeCustomerIDRow getTenantByStripeCustomerID(stripeCustomerId)

Get tenant by Stripe customer ID

### Example

```ts
import {
  Configuration,
  V1TenantsLifecycleApi,
} from '@omnibase/core-js';
import type { GetTenantByStripeCustomerIDRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1TenantsLifecycleApi(config);

  const body = {
    // string
    stripeCustomerId: stripeCustomerId_example,
  } satisfies GetTenantByStripeCustomerIDRequest;

  try {
    const data = await api.getTenantByStripeCustomerID(body);
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
| **stripeCustomerId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**GetTenantByStripeCustomerIDRow**](GetTenantByStripeCustomerIDRow.md)

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


## getTenantJWT

> JWTResponse getTenantJWT()

Get JWT for the current tenant

### Example

```ts
import {
  Configuration,
  V1TenantsLifecycleApi,
} from '@omnibase/core-js';
import type { GetTenantJWTRequest } from '@omnibase/core-js';

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
  const api = new V1TenantsLifecycleApi(config);

  try {
    const data = await api.getTenantJWT();
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

[**JWTResponse**](JWTResponse.md)

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


## switchActiveTenant

> SwitchActiveResponse switchActiveTenant(switchActiveRequest)

Switch the active tenant

### Example

```ts
import {
  Configuration,
  V1TenantsLifecycleApi,
} from '@omnibase/core-js';
import type { SwitchActiveTenantRequest } from '@omnibase/core-js';

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
  const api = new V1TenantsLifecycleApi(config);

  const body = {
    // SwitchActiveRequest
    switchActiveRequest: ...,
  } satisfies SwitchActiveTenantRequest;

  try {
    const data = await api.switchActiveTenant(body);
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
| **switchActiveRequest** | [SwitchActiveRequest](SwitchActiveRequest.md) |  | |

### Return type

[**SwitchActiveResponse**](SwitchActiveResponse.md)

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

