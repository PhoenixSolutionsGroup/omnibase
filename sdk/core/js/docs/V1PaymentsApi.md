# V1PaymentsApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**addInvoiceLineItem**](V1PaymentsApi.md#addinvoicelineitem) | **POST** /api/v1/payments/invoices/{invoice_id}/items | Add a line item to a Stripe invoice |
| [**addInvoiceLineItemWithPriceId**](V1PaymentsApi.md#addinvoicelineitemwithpriceid) | **POST** /api/v1/payments/invoices/{invoice_id}/items/price | Add a line item to a Stripe invoice using a price ID |
| [**createCheckout**](V1PaymentsApi.md#createcheckoutoperation) | **POST** /api/v1/payments/checkout | Create a Stripe checkout session |
| [**createCustomerPortal**](V1PaymentsApi.md#createcustomerportal) | **POST** /api/v1/payments/portal | Create a Stripe customer portal session |
| [**createInvoice**](V1PaymentsApi.md#createinvoiceoperation) | **POST** /api/v1/payments/invoices | Create a Stripe invoice |
| [**finalizeInvoice**](V1PaymentsApi.md#finalizeinvoice) | **POST** /api/v1/payments/invoices/{invoice_id}/finalize | Finalize a Stripe invoice |
| [**getInvoice**](V1PaymentsApi.md#getinvoice) | **GET** /api/v1/payments/invoices/{invoice_id} | Get a Stripe invoice |
| [**recordUsage**](V1PaymentsApi.md#recordusageoperation) | **POST** /api/v1/payments/usage | Record a Stripe meter usage event |
| [**updateInvoice**](V1PaymentsApi.md#updateinvoiceoperation) | **PATCH** /api/v1/payments/invoices/{invoice_id} | Update a Stripe invoice |



## addInvoiceLineItem

> InvoiceLineItemResponse addInvoiceLineItem(invoiceId, addLineItemRequest)

Add a line item to a Stripe invoice

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { AddInvoiceLineItemRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1PaymentsApi(config);

  const body = {
    // string
    invoiceId: invoiceId_example,
    // AddLineItemRequest
    addLineItemRequest: ...,
  } satisfies AddInvoiceLineItemRequest;

  try {
    const data = await api.addInvoiceLineItem(body);
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
| **invoiceId** | `string` |  | [Defaults to `undefined`] |
| **addLineItemRequest** | [AddLineItemRequest](AddLineItemRequest.md) |  | |

### Return type

[**InvoiceLineItemResponse**](InvoiceLineItemResponse.md)

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


## addInvoiceLineItemWithPriceId

> InvoiceLineItemResponse addInvoiceLineItemWithPriceId(invoiceId, addLineItemByPriceRequest)

Add a line item to a Stripe invoice using a price ID

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { AddInvoiceLineItemWithPriceIdRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1PaymentsApi(config);

  const body = {
    // string
    invoiceId: invoiceId_example,
    // AddLineItemByPriceRequest
    addLineItemByPriceRequest: ...,
  } satisfies AddInvoiceLineItemWithPriceIdRequest;

  try {
    const data = await api.addInvoiceLineItemWithPriceId(body);
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
| **invoiceId** | `string` |  | [Defaults to `undefined`] |
| **addLineItemByPriceRequest** | [AddLineItemByPriceRequest](AddLineItemByPriceRequest.md) |  | |

### Return type

[**InvoiceLineItemResponse**](InvoiceLineItemResponse.md)

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


## createCheckout

> CreateCheckoutResponse createCheckout(createCheckoutRequest)

Create a Stripe checkout session

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { CreateCheckoutOperationRequest } from '@omnibase/core-js';

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
  const api = new V1PaymentsApi(config);

  const body = {
    // CreateCheckoutRequest
    createCheckoutRequest: ...,
  } satisfies CreateCheckoutOperationRequest;

  try {
    const data = await api.createCheckout(body);
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
| **createCheckoutRequest** | [CreateCheckoutRequest](CreateCheckoutRequest.md) |  | |

### Return type

[**CreateCheckoutResponse**](CreateCheckoutResponse.md)

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


## createCustomerPortal

> CreatePortalResponse createCustomerPortal(createPortalRequest)

Create a Stripe customer portal session

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { CreateCustomerPortalRequest } from '@omnibase/core-js';

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
  const api = new V1PaymentsApi(config);

  const body = {
    // CreatePortalRequest
    createPortalRequest: ...,
  } satisfies CreateCustomerPortalRequest;

  try {
    const data = await api.createCustomerPortal(body);
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
| **createPortalRequest** | [CreatePortalRequest](CreatePortalRequest.md) |  | |

### Return type

[**CreatePortalResponse**](CreatePortalResponse.md)

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


## createInvoice

> InvoiceResponse createInvoice(createInvoiceRequest)

Create a Stripe invoice

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { CreateInvoiceOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1PaymentsApi(config);

  const body = {
    // CreateInvoiceRequest
    createInvoiceRequest: ...,
  } satisfies CreateInvoiceOperationRequest;

  try {
    const data = await api.createInvoice(body);
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
| **createInvoiceRequest** | [CreateInvoiceRequest](CreateInvoiceRequest.md) |  | |

### Return type

[**InvoiceResponse**](InvoiceResponse.md)

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


## finalizeInvoice

> InvoiceResponse finalizeInvoice(invoiceId, finalizeRequest)

Finalize a Stripe invoice

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { FinalizeInvoiceRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1PaymentsApi(config);

  const body = {
    // string
    invoiceId: invoiceId_example,
    // FinalizeRequest
    finalizeRequest: ...,
  } satisfies FinalizeInvoiceRequest;

  try {
    const data = await api.finalizeInvoice(body);
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
| **invoiceId** | `string` |  | [Defaults to `undefined`] |
| **finalizeRequest** | [FinalizeRequest](FinalizeRequest.md) |  | |

### Return type

[**InvoiceResponse**](InvoiceResponse.md)

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


## getInvoice

> InvoiceResponse getInvoice(invoiceId)

Get a Stripe invoice

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { GetInvoiceRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1PaymentsApi(config);

  const body = {
    // string
    invoiceId: invoiceId_example,
  } satisfies GetInvoiceRequest;

  try {
    const data = await api.getInvoice(body);
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
| **invoiceId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**InvoiceResponse**](InvoiceResponse.md)

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


## recordUsage

> any recordUsage(recordUsageRequest)

Record a Stripe meter usage event

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { RecordUsageOperationRequest } from '@omnibase/core-js';

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
  const api = new V1PaymentsApi(config);

  const body = {
    // RecordUsageRequest
    recordUsageRequest: ...,
  } satisfies RecordUsageOperationRequest;

  try {
    const data = await api.recordUsage(body);
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
| **recordUsageRequest** | [RecordUsageRequest](RecordUsageRequest.md) |  | |

### Return type

**any**

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


## updateInvoice

> InvoiceResponse updateInvoice(invoiceId, updateInvoiceRequest)

Update a Stripe invoice

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { UpdateInvoiceOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1PaymentsApi(config);

  const body = {
    // string
    invoiceId: invoiceId_example,
    // UpdateInvoiceRequest
    updateInvoiceRequest: ...,
  } satisfies UpdateInvoiceOperationRequest;

  try {
    const data = await api.updateInvoice(body);
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
| **invoiceId** | `string` |  | [Defaults to `undefined`] |
| **updateInvoiceRequest** | [UpdateInvoiceRequest](UpdateInvoiceRequest.md) |  | |

### Return type

[**InvoiceResponse**](InvoiceResponse.md)

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

