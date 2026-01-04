# V1WebhooksApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**configureWebhooks**](V1WebhooksApi.md#configurewebhooks) | **POST** /api/v1/stripe/config/webhooks | Configure multiple webhook endpoints |
| [**getWebhookSecret**](V1WebhooksApi.md#getwebhooksecret) | **GET** /api/v1/stripe/config/webhook | Get webhook secret |



## configureWebhooks

> ConfigureWebhooks200Response configureWebhooks(webhooksConfigRequest)

Configure multiple webhook endpoints

Creates, updates, or removes multiple webhook endpoints to match the desired configuration. Webhooks not in the request will be deleted.  ## Authentication Requires service key authentication.  ## Connect Webhooks Each webhook can have &#x60;connect: true&#x60; to listen to events from connected accounts.  ## URL Interpolation URLs support &#x60;${VAR}&#x60; environment variable interpolation when using the CLI. The CLI resolves these before sending to the API.  ## Use Cases - Configure multiple webhooks for different environments - Set up both account and Connect webhooks - Declarative webhook configuration management 

### Example

```ts
import {
  Configuration,
  V1WebhooksApi,
} from '@omnibase/core-js';
import type { ConfigureWebhooksRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1WebhooksApi(config);

  const body = {
    // WebhooksConfigRequest
    webhooksConfigRequest: ...,
  } satisfies ConfigureWebhooksRequest;

  try {
    const data = await api.configureWebhooks(body);
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
| **webhooksConfigRequest** | [WebhooksConfigRequest](WebhooksConfigRequest.md) |  | |

### Return type

[**ConfigureWebhooks200Response**](ConfigureWebhooks200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Webhooks configured successfully |  -  |
| **400** | Invalid request - validation errors or invalid Stripe event types |  -  |
| **401** | Invalid or missing service key |  -  |
| **409** | Conflict - duplicate webhook URL provided |  -  |
| **500** | Failed to configure webhooks |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getWebhookSecret

> GetWebhookSecret200Response getWebhookSecret()

Get webhook secret

Retrieves the webhook signing secret for the most recent webhook configuration.  ## Authentication Requires service key authentication.  ## Use Cases - Retrieve signing secret for webhook signature verification - Debug webhook configuration 

### Example

```ts
import {
  Configuration,
  V1WebhooksApi,
} from '@omnibase/core-js';
import type { GetWebhookSecretRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1WebhooksApi(config);

  try {
    const data = await api.getWebhookSecret();
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

[**GetWebhookSecret200Response**](GetWebhookSecret200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Webhook secret retrieved successfully |  -  |
| **401** | Invalid or missing service key |  -  |
| **404** | No webhook configured |  -  |
| **500** | Failed to retrieve webhook secret |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

