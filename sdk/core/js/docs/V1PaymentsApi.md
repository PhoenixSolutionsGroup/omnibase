# V1PaymentsApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**addInvoiceLineItem**](V1PaymentsApi.md#addinvoicelineitemoperation) | **POST** /api/v1/payments/invoices/{invoice_id}/items | Add invoice line item |
| [**addInvoiceLineItemWithPriceId**](V1PaymentsApi.md#addinvoicelineitemwithpriceid) | **POST** /api/v1/payments/invoices/{invoice_id}/items/price | Add invoice line item with price ID |
| [**createCheckout**](V1PaymentsApi.md#createcheckoutoperation) | **POST** /api/v1/payments/checkout | Create checkout session |
| [**createCustomerPortal**](V1PaymentsApi.md#createcustomerportal) | **POST** /api/v1/payments/portal | Create customer portal session |
| [**createInvoice**](V1PaymentsApi.md#createinvoiceoperation) | **POST** /api/v1/payments/invoices | Create invoice |
| [**finalizeInvoice**](V1PaymentsApi.md#finalizeinvoiceoperation) | **POST** /api/v1/payments/invoices/{invoice_id}/finalize | Finalize invoice |
| [**getInvoice**](V1PaymentsApi.md#getinvoice) | **GET** /api/v1/payments/invoices/{invoice_id} | Get invoice |
| [**recordUsage**](V1PaymentsApi.md#recordusageoperation) | **POST** /api/v1/payments/usage | Record metered usage |
| [**updateInvoice**](V1PaymentsApi.md#updateinvoiceoperation) | **PATCH** /api/v1/payments/invoices/{invoice_id} | Update invoice |



## addInvoiceLineItem

> AddInvoiceLineItem200Response addInvoiceLineItem(xServiceKey, invoiceId, addInvoiceLineItemRequest, xTenantId, xStripeCustomerId)

Add invoice line item

Adds a new line item to a draft invoice.  ## Authentication Requires service key authentication via &#x60;X-Service-Key&#x60; header.  ## Customer Identification You must provide the Stripe customer ID using ONE of: - &#x60;X-Stripe-Customer-Id&#x60; header: Directly specify the Stripe customer ID - &#x60;X-Tenant-Id&#x60; header: Look up the Stripe customer ID from the tenant\&#39;s configuration  ## Prerequisites - Invoice must be in draft status  ## Use Cases - Adding platform fees - Adding additional charges - Custom billing line items 

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { AddInvoiceLineItemOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const api = new V1PaymentsApi();

  const body = {
    // string | Service key for authentication
    xServiceKey: xServiceKey_example,
    // string | Stripe Invoice ID
    invoiceId: invoiceId_example,
    // AddInvoiceLineItemRequest
    addInvoiceLineItemRequest: ...,
    // string | Tenant ID (UUID) - Used to look up the Stripe customer ID from tenant configuration. Required if X-Stripe-Customer-Id is not provided. (optional)
    xTenantId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Stripe Customer ID (e.g., cus_xxx) - Directly specify the customer. Required if X-Tenant-Id is not provided. (optional)
    xStripeCustomerId: xStripeCustomerId_example,
  } satisfies AddInvoiceLineItemOperationRequest;

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
| **xServiceKey** | `string` | Service key for authentication | [Defaults to `undefined`] |
| **invoiceId** | `string` | Stripe Invoice ID | [Defaults to `undefined`] |
| **addInvoiceLineItemRequest** | [AddInvoiceLineItemRequest](AddInvoiceLineItemRequest.md) |  | |
| **xTenantId** | `string` | Tenant ID (UUID) - Used to look up the Stripe customer ID from tenant configuration. Required if X-Stripe-Customer-Id is not provided. | [Optional] [Defaults to `undefined`] |
| **xStripeCustomerId** | `string` | Stripe Customer ID (e.g., cus_xxx) - Directly specify the customer. Required if X-Tenant-Id is not provided. | [Optional] [Defaults to `undefined`] |

### Return type

[**AddInvoiceLineItem200Response**](AddInvoiceLineItem200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Line item added successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **404** | Not Found - Resource not found |  -  |
| **409** | Conflict - Resource already exists or conflicts with current state |  -  |
| **429** | Too Many Requests - Rate limit exceeded |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## addInvoiceLineItemWithPriceId

> AddInvoiceLineItem200Response addInvoiceLineItemWithPriceId(xServiceKey, invoiceId, addInvoiceLineItemWithPriceIDRequest, xTenantId, xStripeCustomerId)

Add invoice line item with price ID

Adds a new line item to a draft invoice using a price ID and quantity.  ## Authentication Requires service key authentication via &#x60;X-Service-Key&#x60; header.  ## Customer Identification You must provide the Stripe customer ID using ONE of: - &#x60;X-Stripe-Customer-Id&#x60; header: Directly specify the Stripe customer ID - &#x60;X-Tenant-Id&#x60; header: Look up the Stripe customer ID from the tenant\&#39;s configuration  ## Price ID Resolution You must provide ONE of: - &#x60;price_id&#x60;: A config price ID (e.g., \&quot;hetzner_cx23_nbg1_hourly\&quot;) that will be looked up via the Stripe ID mapping table - &#x60;stripe_price_id&#x60;: A raw Stripe price ID (e.g., \&quot;price_1ABC...\&quot;) that will be used directly  ## Prerequisites - Invoice must be in draft status  ## Use Cases - Adding metered usage line items - Adding subscription-based charges - Billing for compute hours, storage, etc. 

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { AddInvoiceLineItemWithPriceIdRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const api = new V1PaymentsApi();

  const body = {
    // string | Service key for authentication
    xServiceKey: xServiceKey_example,
    // string | Stripe Invoice ID
    invoiceId: invoiceId_example,
    // AddInvoiceLineItemWithPriceIDRequest
    addInvoiceLineItemWithPriceIDRequest: ...,
    // string | Tenant ID (UUID) - Used to look up the Stripe customer ID from tenant configuration. Required if X-Stripe-Customer-Id is not provided. (optional)
    xTenantId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Stripe Customer ID (e.g., cus_xxx) - Directly specify the customer. Required if X-Tenant-Id is not provided. (optional)
    xStripeCustomerId: xStripeCustomerId_example,
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
| **xServiceKey** | `string` | Service key for authentication | [Defaults to `undefined`] |
| **invoiceId** | `string` | Stripe Invoice ID | [Defaults to `undefined`] |
| **addInvoiceLineItemWithPriceIDRequest** | [AddInvoiceLineItemWithPriceIDRequest](AddInvoiceLineItemWithPriceIDRequest.md) |  | |
| **xTenantId** | `string` | Tenant ID (UUID) - Used to look up the Stripe customer ID from tenant configuration. Required if X-Stripe-Customer-Id is not provided. | [Optional] [Defaults to `undefined`] |
| **xStripeCustomerId** | `string` | Stripe Customer ID (e.g., cus_xxx) - Directly specify the customer. Required if X-Tenant-Id is not provided. | [Optional] [Defaults to `undefined`] |

### Return type

[**AddInvoiceLineItem200Response**](AddInvoiceLineItem200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Line item added successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **404** | Not Found - Resource not found |  -  |
| **409** | Conflict - Resource already exists or conflicts with current state |  -  |
| **429** | Too Many Requests - Rate limit exceeded |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createCheckout

> CreateCheckout200Response createCheckout(createCheckoutRequest)

Create checkout session

Creates a Stripe Checkout Session for the specified price ID. The session URL can be used to redirect users to complete payment.  ## Authentication Optional cookie authentication. If authenticated and user has a Stripe customer ID, it will be used; otherwise, a new customer will be created.  ## Use Cases - Subscription sign-ups - One-time purchases - Trial period checkouts - Promotional code redemption 

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { CreateCheckoutOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const api = new V1PaymentsApi();

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

[**CreateCheckout200Response**](CreateCheckout200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Checkout session created successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **404** | Not Found - Resource not found |  -  |
| **409** | Conflict - Resource already exists or conflicts with current state |  -  |
| **429** | Too Many Requests - Rate limit exceeded |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createCustomerPortal

> CreateCustomerPortal200Response createCustomerPortal(createPortalRequest)

Create customer portal session

Creates a Stripe Customer Portal session where users can manage their subscription, payment methods, and billing history.  ## Authentication Requires cookie authentication with an associated Stripe customer ID (set via payments middleware).  ## Prerequisites - User must be authenticated - Tenant must have a Stripe customer ID configured - If stripe_customer_id not found in context, returns 400: \&quot;stripe_customer_id not found in context\&quot;  ## Use Cases - Subscription management - Payment method updates - Invoice history viewing - Subscription cancellation 

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { CreateCustomerPortalRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const api = new V1PaymentsApi();

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

[**CreateCustomerPortal200Response**](CreateCustomerPortal200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Portal session created successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **429** | Too Many Requests - Rate limit exceeded |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createInvoice

> CreateInvoice200Response createInvoice(xServiceKey, createInvoiceRequest, xTenantId, xStripeCustomerId)

Create invoice

Creates a new draft invoice for the specified customer.  ## Authentication Requires service key authentication via &#x60;X-Service-Key&#x60; header.  ## Customer Identification You must provide the Stripe customer ID using ONE of: - &#x60;X-Stripe-Customer-Id&#x60; header: Directly specify the Stripe customer ID - &#x60;X-Tenant-Id&#x60; header: Look up the Stripe customer ID from the tenant\&#39;s configuration  ## Use Cases - Creating invoices for platform fees - Manual billing scenarios - Custom invoice generation 

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { CreateInvoiceOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const api = new V1PaymentsApi();

  const body = {
    // string | Service key for authentication
    xServiceKey: xServiceKey_example,
    // CreateInvoiceRequest
    createInvoiceRequest: ...,
    // string | Tenant ID (UUID) - Used to look up the Stripe customer ID from tenant configuration. Required if X-Stripe-Customer-Id is not provided. (optional)
    xTenantId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Stripe Customer ID (e.g., cus_xxx) - Directly specify the customer. Required if X-Tenant-Id is not provided. (optional)
    xStripeCustomerId: xStripeCustomerId_example,
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
| **xServiceKey** | `string` | Service key for authentication | [Defaults to `undefined`] |
| **createInvoiceRequest** | [CreateInvoiceRequest](CreateInvoiceRequest.md) |  | |
| **xTenantId** | `string` | Tenant ID (UUID) - Used to look up the Stripe customer ID from tenant configuration. Required if X-Stripe-Customer-Id is not provided. | [Optional] [Defaults to `undefined`] |
| **xStripeCustomerId** | `string` | Stripe Customer ID (e.g., cus_xxx) - Directly specify the customer. Required if X-Tenant-Id is not provided. | [Optional] [Defaults to `undefined`] |

### Return type

[**CreateInvoice200Response**](CreateInvoice200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Invoice created successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **409** | Conflict - Resource already exists or conflicts with current state |  -  |
| **429** | Too Many Requests - Rate limit exceeded |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## finalizeInvoice

> CreateInvoice200Response finalizeInvoice(xServiceKey, invoiceId, finalizeInvoiceRequest)

Finalize invoice

Finalizes a draft invoice, optionally auto-advancing to send it immediately.  ## Authentication Requires service key authentication via &#x60;X-Service-Key&#x60; header.  ## Prerequisites - Invoice must be in draft status  ## Use Cases - Approving invoices for sending - Completing invoice preparation - Triggering invoice emails 

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { FinalizeInvoiceOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const api = new V1PaymentsApi();

  const body = {
    // string | Service key for authentication
    xServiceKey: xServiceKey_example,
    // string | Stripe Invoice ID
    invoiceId: invoiceId_example,
    // FinalizeInvoiceRequest
    finalizeInvoiceRequest: ...,
  } satisfies FinalizeInvoiceOperationRequest;

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
| **xServiceKey** | `string` | Service key for authentication | [Defaults to `undefined`] |
| **invoiceId** | `string` | Stripe Invoice ID | [Defaults to `undefined`] |
| **finalizeInvoiceRequest** | [FinalizeInvoiceRequest](FinalizeInvoiceRequest.md) |  | |

### Return type

[**CreateInvoice200Response**](CreateInvoice200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Invoice finalized successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **404** | Not Found - Resource not found |  -  |
| **409** | Conflict - Resource already exists or conflicts with current state |  -  |
| **429** | Too Many Requests - Rate limit exceeded |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getInvoice

> CreateInvoice200Response getInvoice(xServiceKey, invoiceId)

Get invoice

Retrieves a Stripe invoice by its ID.  ## Authentication Requires service key authentication via &#x60;X-Service-Key&#x60; header.  ## Use Cases - Webhook processing - Invoice status checking - Invoice data retrieval 

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { GetInvoiceRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const api = new V1PaymentsApi();

  const body = {
    // string | Service key for authentication
    xServiceKey: xServiceKey_example,
    // string | Stripe Invoice ID
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
| **xServiceKey** | `string` | Service key for authentication | [Defaults to `undefined`] |
| **invoiceId** | `string` | Stripe Invoice ID | [Defaults to `undefined`] |

### Return type

[**CreateInvoice200Response**](CreateInvoice200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Invoice retrieved successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **404** | Not Found - Resource not found |  -  |
| **429** | Too Many Requests - Rate limit exceeded |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## recordUsage

> SuccessResponse recordUsage(recordUsageRequest)

Record metered usage

Records a usage event for metered billing. The customer must have an active subscription with metered pricing.  ## Authentication Requires cookie authentication with an associated Stripe customer ID (set via payments middleware).  ## Prerequisites - User must be authenticated - Tenant must have a Stripe customer ID configured - If stripe_customer_id not found in context, returns 400: \&quot;stripe_customer_id not found in context\&quot;  ## Use Cases - API request metering - Compute time tracking - Storage usage recording - Any metered billing scenario 

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { RecordUsageOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const api = new V1PaymentsApi();

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

[**SuccessResponse**](SuccessResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Usage recorded successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **429** | Too Many Requests - Rate limit exceeded |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateInvoice

> CreateInvoice200Response updateInvoice(xServiceKey, invoiceId, updateInvoiceRequest)

Update invoice

Updates a draft invoice\&#39;s description and metadata.  ## Authentication Requires service key authentication via &#x60;X-Service-Key&#x60; header.  ## Prerequisites - Invoice must be in draft status  ## Use Cases - Adding custom descriptions - Adding metadata for tracking - Customizing invoice before sending 

### Example

```ts
import {
  Configuration,
  V1PaymentsApi,
} from '@omnibase/core-js';
import type { UpdateInvoiceOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const api = new V1PaymentsApi();

  const body = {
    // string | Service key for authentication
    xServiceKey: xServiceKey_example,
    // string | Stripe Invoice ID
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
| **xServiceKey** | `string` | Service key for authentication | [Defaults to `undefined`] |
| **invoiceId** | `string` | Stripe Invoice ID | [Defaults to `undefined`] |
| **updateInvoiceRequest** | [UpdateInvoiceRequest](UpdateInvoiceRequest.md) |  | |

### Return type

[**CreateInvoice200Response**](CreateInvoice200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Invoice updated successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **404** | Not Found - Resource not found |  -  |
| **409** | Conflict - Resource already exists or conflicts with current state |  -  |
| **429** | Too Many Requests - Rate limit exceeded |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

