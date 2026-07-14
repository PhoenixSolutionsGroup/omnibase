# V1WebhooksApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**listWebhooks**](V1WebhooksApi.md#listwebhooks) | **GET** /api/v1/stripe/admin/webhooks | List all webhooks |



## listWebhooks

> ListWebhooks200Response listWebhooks()

List all webhooks

Retrieves all configured webhook endpoints with their signing secrets.  ## Authentication Requires service key authentication.  ## Use Cases - List all webhook configurations - Retrieve signing secrets for webhook signature verification - Debug webhook configuration 

### Example

```ts
import {
  Configuration,
  V1WebhooksApi,
} from '@omnibase/core-js';
import type { ListWebhooksRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1WebhooksApi(config);

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

[**ListWebhooks200Response**](ListWebhooks200Response.md)

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

