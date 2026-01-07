# \V1WebhooksAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ConfigureWebhooks**](V1WebhooksAPI.md#ConfigureWebhooks) | **Post** /api/v1/stripe/config/webhooks | Configure multiple webhook endpoints
[**GetWebhookSecret**](V1WebhooksAPI.md#GetWebhookSecret) | **Get** /api/v1/stripe/config/webhook | Get webhook secret



## ConfigureWebhooks

> ConfigureWebhooks200Response ConfigureWebhooks(ctx).WebhooksConfigRequest(webhooksConfigRequest).Execute()

Configure multiple webhook endpoints



### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"
)

func main() {
	webhooksConfigRequest := *openapiclient.NewWebhooksConfigRequest([]openapiclient.WebhookEndpointConfig{*openapiclient.NewWebhookEndpointConfig("https://example.com/webhooks/stripe", []string{"Events_example"})}) // WebhooksConfigRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1WebhooksAPI.ConfigureWebhooks(context.Background()).WebhooksConfigRequest(webhooksConfigRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1WebhooksAPI.ConfigureWebhooks``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ConfigureWebhooks`: ConfigureWebhooks200Response
	fmt.Fprintf(os.Stdout, "Response from `V1WebhooksAPI.ConfigureWebhooks`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiConfigureWebhooksRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **webhooksConfigRequest** | [**WebhooksConfigRequest**](WebhooksConfigRequest.md) |  | 

### Return type

[**ConfigureWebhooks200Response**](ConfigureWebhooks200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetWebhookSecret

> GetWebhookSecret200Response GetWebhookSecret(ctx).Execute()

Get webhook secret



### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"
)

func main() {

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1WebhooksAPI.GetWebhookSecret(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1WebhooksAPI.GetWebhookSecret``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetWebhookSecret`: GetWebhookSecret200Response
	fmt.Fprintf(os.Stdout, "Response from `V1WebhooksAPI.GetWebhookSecret`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetWebhookSecretRequest struct via the builder pattern


### Return type

[**GetWebhookSecret200Response**](GetWebhookSecret200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

