# \StripeAPI

All URIs are relative to *http://https://api.omnibase.tech/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ArchiveAllStripeConfig**](StripeAPI.md#ArchiveAllStripeConfig) | **Post** /stripe/config/archive-all | Archive all Stripe config
[**GetStripeConfig**](StripeAPI.md#GetStripeConfig) | **Get** /stripe/config | Get public Stripe config
[**GetStripeConfigAdmin**](StripeAPI.md#GetStripeConfigAdmin) | **Get** /stripe/config/admin | Get full Stripe config (admin)
[**GetStripeConfigHistory**](StripeAPI.md#GetStripeConfigHistory) | **Get** /stripe/config/history | Get config history
[**GetStripeConfigSchema**](StripeAPI.md#GetStripeConfigSchema) | **Get** /stripe/schema | Get Stripe config schema
[**PullStripeConfig**](StripeAPI.md#PullStripeConfig) | **Get** /stripe/config/pull | Pull config from Stripe
[**UpdateStripeConfig**](StripeAPI.md#UpdateStripeConfig) | **Post** /stripe/config | Update Stripe config
[**ValidateStripeConfig**](StripeAPI.md#ValidateStripeConfig) | **Post** /stripe/config/validate | Validate Stripe config



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
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.StripeAPI.ArchiveAllStripeConfig(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StripeAPI.ArchiveAllStripeConfig``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ArchiveAllStripeConfig`: ArchiveAllStripeConfig200Response
	fmt.Fprintf(os.Stdout, "Response from `StripeAPI.ArchiveAllStripeConfig`: %v\n", resp)
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
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.StripeAPI.GetStripeConfig(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StripeAPI.GetStripeConfig``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetStripeConfig`: GetStripeConfig200Response
	fmt.Fprintf(os.Stdout, "Response from `StripeAPI.GetStripeConfig`: %v\n", resp)
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
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.StripeAPI.GetStripeConfigAdmin(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StripeAPI.GetStripeConfigAdmin``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetStripeConfigAdmin`: GetStripeConfig200Response
	fmt.Fprintf(os.Stdout, "Response from `StripeAPI.GetStripeConfigAdmin`: %v\n", resp)
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
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	limit := int32(56) // int32 | Items per page (optional) (default to 10)
	offset := int32(56) // int32 | Items to skip (optional) (default to 0)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.StripeAPI.GetStripeConfigHistory(context.Background()).Limit(limit).Offset(offset).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StripeAPI.GetStripeConfigHistory``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetStripeConfigHistory`: GetStripeConfigHistory200Response
	fmt.Fprintf(os.Stdout, "Response from `StripeAPI.GetStripeConfigHistory`: %v\n", resp)
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
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.StripeAPI.GetStripeConfigSchema(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StripeAPI.GetStripeConfigSchema``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetStripeConfigSchema`: map[string]interface{}
	fmt.Fprintf(os.Stdout, "Response from `StripeAPI.GetStripeConfigSchema`: %v\n", resp)
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
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.StripeAPI.PullStripeConfig(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StripeAPI.PullStripeConfig``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `PullStripeConfig`: PullStripeConfig200Response
	fmt.Fprintf(os.Stdout, "Response from `StripeAPI.PullStripeConfig`: %v\n", resp)
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
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	config := map[string]interface{}{"key": interface{}(123)} // map[string]interface{} | Stripe configuration data

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.StripeAPI.UpdateStripeConfig(context.Background()).Config(config).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StripeAPI.UpdateStripeConfig``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `UpdateStripeConfig`: HandlersSuccessResponse
	fmt.Fprintf(os.Stdout, "Response from `StripeAPI.UpdateStripeConfig`: %v\n", resp)
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
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	config := map[string]interface{}{"key": interface{}(123)} // map[string]interface{} | Stripe configuration to validate

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.StripeAPI.ValidateStripeConfig(context.Background()).Config(config).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StripeAPI.ValidateStripeConfig``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ValidateStripeConfig`: HandlersSuccessResponse
	fmt.Fprintf(os.Stdout, "Response from `StripeAPI.ValidateStripeConfig`: %v\n", resp)
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

