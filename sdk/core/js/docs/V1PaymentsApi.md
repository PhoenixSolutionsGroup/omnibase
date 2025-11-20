# V1PaymentsApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createCheckout**](V1PaymentsApi.md#createcheckoutoperation) | **POST** /api/v1/payments/checkout | Create checkout session |
| [**createCustomerPortal**](V1PaymentsApi.md#createcustomerportal) | **POST** /api/v1/payments/portal | Create customer portal session |
| [**recordUsage**](V1PaymentsApi.md#recordusageoperation) | **POST** /api/v1/payments/usage | Record metered usage |



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
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Checkout session created successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **404** | Not Found - Resource not found |  -  |
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
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Portal session created successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
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
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Usage recorded successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

