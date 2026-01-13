# V1EventsApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**connectWebSocket**](V1EventsApi.md#connectwebsocket) | **GET** /api/v1/events | WebSocket connection for real-time events |



## connectWebSocket

> connectWebSocket()

WebSocket connection for real-time events

WebSocket endpoint for receiving real-time database change notifications with Row-Level Security (RLS) enforcement.  ## Connection Details - Protocol: WebSocket - Upgrade from HTTP GET request  ## Authentication Session authentication via JWT token sent in subscription messages.  ## Message Format **Subscribe to changes:** &#x60;&#x60;&#x60;json {   \&quot;action\&quot;: \&quot;subscribe\&quot;,   \&quot;subscription\&quot;: {     \&quot;table\&quot;: \&quot;projects\&quot;,     \&quot;row_id\&quot;: \&quot;project_test_123\&quot;,     \&quot;columns\&quot;: [\&quot;name\&quot;, \&quot;status\&quot;],     \&quot;jwt\&quot;: \&quot;eyJhbGciOiJIUzI1NiIs...\&quot;   } } &#x60;&#x60;&#x60;  **Unsubscribe:** &#x60;&#x60;&#x60;json {   \&quot;action\&quot;: \&quot;unsubscribe\&quot;,   \&quot;subscription\&quot;: {     \&quot;table\&quot;: \&quot;projects\&quot;,     \&quot;row_id\&quot;: \&quot;project_test_123\&quot;   } } &#x60;&#x60;&#x60;  **Received updates:** &#x60;&#x60;&#x60;json {   \&quot;type\&quot;: \&quot;update\&quot;,   \&quot;table\&quot;: \&quot;projects\&quot;,   \&quot;row_id\&quot;: \&quot;project_test_123\&quot;,   \&quot;data\&quot;: {     \&quot;name\&quot;: \&quot;Updated Project\&quot;,     \&quot;status\&quot;: \&quot;active\&quot;   } } &#x60;&#x60;&#x60;  ## RLS Enforcement - Access checked via PostgREST using provided JWT - Only changes to accessible rows are broadcast - Re-validates access on each change notification  ## Use Cases - Real-time collaboration features - Live data synchronization - Notification systems - Activity feeds 

### Example

```ts
import {
  Configuration,
  V1EventsApi,
} from '@omnibase/core-js';
import type { ConnectWebSocketRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const api = new V1EventsApi();

  try {
    const data = await api.connectWebSocket();
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

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **101** | Switching Protocols - WebSocket connection established |  -  |
| **400** | Bad Request - Invalid WebSocket upgrade |  -  |
| **401** | Unauthorized - Invalid JWT in subscription message |  -  |
| **404** | Not Found - Resource not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

