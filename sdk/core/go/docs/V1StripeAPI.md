# \V1StripeAPI

All URIs are relative to *http://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ArchiveAllStripeConfig**](V1StripeAPI.md#ArchiveAllStripeConfig) | **Post** /api/v1/stripe/config/archive-all | Archive all Stripe config
[**GetStripeConfig**](V1StripeAPI.md#GetStripeConfig) | **Get** /api/v1/stripe/config | Get public Stripe config
[**GetStripeConfigAdmin**](V1StripeAPI.md#GetStripeConfigAdmin) | **Get** /api/v1/stripe/config/admin | Get full Stripe config (admin)
[**GetStripeConfigHistory**](V1StripeAPI.md#GetStripeConfigHistory) | **Get** /api/v1/stripe/config/history | Get config history
[**GetStripeConfigSchema**](V1StripeAPI.md#GetStripeConfigSchema) | **Get** /api/v1/stripe/schema | Get Stripe config schema
[**PullStripeConfig**](V1StripeAPI.md#PullStripeConfig) | **Get** /api/v1/stripe/config/pull | Pull config from Stripe
[**UpdateStripeConfig**](V1StripeAPI.md#UpdateStripeConfig) | **Post** /api/v1/stripe/config | Update Stripe config
[**ValidateStripeConfig**](V1StripeAPI.md#ValidateStripeConfig) | **Post** /api/v1/stripe/config/validate | Validate Stripe config



## ArchiveAllStripeConfig

> ArchiveAllStripeConfig200Response ArchiveAllStripeConfig(ctx).Execute()

Archive all Stripe config



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
	resp, r, err := apiClient.V1StripeAPI.ArchiveAllStripeConfig(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.ArchiveAllStripeConfig``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ArchiveAllStripeConfig`: ArchiveAllStripeConfig200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.ArchiveAllStripeConfig`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiArchiveAllStripeConfigRequest struct via the builder pattern


### Return type

[**ArchiveAllStripeConfig200Response**](ArchiveAllStripeConfig200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetStripeConfig

> GetStripeConfig200Response GetStripeConfig(ctx).Execute()

Get public Stripe config



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
	resp, r, err := apiClient.V1StripeAPI.GetStripeConfig(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.GetStripeConfig``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetStripeConfig`: GetStripeConfig200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.GetStripeConfig`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetStripeConfigRequest struct via the builder pattern


### Return type

[**GetStripeConfig200Response**](GetStripeConfig200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetStripeConfigAdmin

> GetStripeConfig200Response GetStripeConfigAdmin(ctx).Execute()

Get full Stripe config (admin)



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
	resp, r, err := apiClient.V1StripeAPI.GetStripeConfigAdmin(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.GetStripeConfigAdmin``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetStripeConfigAdmin`: GetStripeConfig200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.GetStripeConfigAdmin`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetStripeConfigAdminRequest struct via the builder pattern


### Return type

[**GetStripeConfig200Response**](GetStripeConfig200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetStripeConfigHistory

> GetStripeConfigHistory200Response GetStripeConfigHistory(ctx).Limit(limit).Offset(offset).Execute()

Get config history



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
	limit := int32(56) // int32 | Items per page (optional) (default to 10)
	offset := int32(56) // int32 | Items to skip (optional) (default to 0)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StripeAPI.GetStripeConfigHistory(context.Background()).Limit(limit).Offset(offset).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.GetStripeConfigHistory``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetStripeConfigHistory`: GetStripeConfigHistory200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.GetStripeConfigHistory`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiGetStripeConfigHistoryRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **int32** | Items per page | [default to 10]
 **offset** | **int32** | Items to skip | [default to 0]

### Return type

[**GetStripeConfigHistory200Response**](GetStripeConfigHistory200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetStripeConfigSchema

> map[string]interface{} GetStripeConfigSchema(ctx).Execute()

Get Stripe config schema



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
	resp, r, err := apiClient.V1StripeAPI.GetStripeConfigSchema(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.GetStripeConfigSchema``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetStripeConfigSchema`: map[string]interface{}
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.GetStripeConfigSchema`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetStripeConfigSchemaRequest struct via the builder pattern


### Return type

**map[string]interface{}**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## PullStripeConfig

> PullStripeConfig200Response PullStripeConfig(ctx).Execute()

Pull config from Stripe



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
	resp, r, err := apiClient.V1StripeAPI.PullStripeConfig(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.PullStripeConfig``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `PullStripeConfig`: PullStripeConfig200Response
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.PullStripeConfig`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiPullStripeConfigRequest struct via the builder pattern


### Return type

[**PullStripeConfig200Response**](PullStripeConfig200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## UpdateStripeConfig

> HandlersSuccessResponse UpdateStripeConfig(ctx).Config(config).Execute()

Update Stripe config



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
	config := map[string]interface{}{"key": interface{}(123)} // map[string]interface{} | Stripe configuration data

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StripeAPI.UpdateStripeConfig(context.Background()).Config(config).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.UpdateStripeConfig``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `UpdateStripeConfig`: HandlersSuccessResponse
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.UpdateStripeConfig`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiUpdateStripeConfigRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **config** | **map[string]interface{}** | Stripe configuration data | 

### Return type

[**HandlersSuccessResponse**](HandlersSuccessResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ValidateStripeConfig

> HandlersSuccessResponse ValidateStripeConfig(ctx).Config(config).Execute()

Validate Stripe config



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
	config := map[string]interface{}{"key": interface{}(123)} // map[string]interface{} | Stripe configuration to validate

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1StripeAPI.ValidateStripeConfig(context.Background()).Config(config).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1StripeAPI.ValidateStripeConfig``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ValidateStripeConfig`: HandlersSuccessResponse
	fmt.Fprintf(os.Stdout, "Response from `V1StripeAPI.ValidateStripeConfig`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiValidateStripeConfigRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **config** | **map[string]interface{}** | Stripe configuration to validate | 

### Return type

[**HandlersSuccessResponse**](HandlersSuccessResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

