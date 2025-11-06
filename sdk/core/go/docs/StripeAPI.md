# \StripeAPI

All URIs are relative to *http://https://api.omnibase.tech/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**StripeConfigAdminGet**](StripeAPI.md#StripeConfigAdminGet) | **Get** /stripe/config/admin | Get full Stripe config (admin)
[**StripeConfigArchiveAllPost**](StripeAPI.md#StripeConfigArchiveAllPost) | **Post** /stripe/config/archive-all | Archive all Stripe config
[**StripeConfigGet**](StripeAPI.md#StripeConfigGet) | **Get** /stripe/config | Get public Stripe config
[**StripeConfigHistoryGet**](StripeAPI.md#StripeConfigHistoryGet) | **Get** /stripe/config/history | Get config history
[**StripeConfigPost**](StripeAPI.md#StripeConfigPost) | **Post** /stripe/config | Update Stripe config
[**StripeConfigPullGet**](StripeAPI.md#StripeConfigPullGet) | **Get** /stripe/config/pull | Pull config from Stripe
[**StripeConfigValidatePost**](StripeAPI.md#StripeConfigValidatePost) | **Post** /stripe/config/validate | Validate Stripe config
[**StripeSchemaGet**](StripeAPI.md#StripeSchemaGet) | **Get** /stripe/schema | Get Stripe config schema



## StripeConfigAdminGet

> StripeConfigGet200Response StripeConfigAdminGet(ctx).Execute()

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
	resp, r, err := apiClient.StripeAPI.StripeConfigAdminGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StripeAPI.StripeConfigAdminGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `StripeConfigAdminGet`: StripeConfigGet200Response
	fmt.Fprintf(os.Stdout, "Response from `StripeAPI.StripeConfigAdminGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiStripeConfigAdminGetRequest struct via the builder pattern


### Return type

[**StripeConfigGet200Response**](StripeConfigGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## StripeConfigArchiveAllPost

> StripeConfigArchiveAllPost200Response StripeConfigArchiveAllPost(ctx).Execute()

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
	resp, r, err := apiClient.StripeAPI.StripeConfigArchiveAllPost(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StripeAPI.StripeConfigArchiveAllPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `StripeConfigArchiveAllPost`: StripeConfigArchiveAllPost200Response
	fmt.Fprintf(os.Stdout, "Response from `StripeAPI.StripeConfigArchiveAllPost`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiStripeConfigArchiveAllPostRequest struct via the builder pattern


### Return type

[**StripeConfigArchiveAllPost200Response**](StripeConfigArchiveAllPost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## StripeConfigGet

> StripeConfigGet200Response StripeConfigGet(ctx).Execute()

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
	resp, r, err := apiClient.StripeAPI.StripeConfigGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StripeAPI.StripeConfigGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `StripeConfigGet`: StripeConfigGet200Response
	fmt.Fprintf(os.Stdout, "Response from `StripeAPI.StripeConfigGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiStripeConfigGetRequest struct via the builder pattern


### Return type

[**StripeConfigGet200Response**](StripeConfigGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## StripeConfigHistoryGet

> StripeConfigHistoryGet200Response StripeConfigHistoryGet(ctx).Limit(limit).Offset(offset).Execute()

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
	resp, r, err := apiClient.StripeAPI.StripeConfigHistoryGet(context.Background()).Limit(limit).Offset(offset).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StripeAPI.StripeConfigHistoryGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `StripeConfigHistoryGet`: StripeConfigHistoryGet200Response
	fmt.Fprintf(os.Stdout, "Response from `StripeAPI.StripeConfigHistoryGet`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiStripeConfigHistoryGetRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **int32** | Items per page | [default to 10]
 **offset** | **int32** | Items to skip | [default to 0]

### Return type

[**StripeConfigHistoryGet200Response**](StripeConfigHistoryGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## StripeConfigPost

> HandlersSuccessResponse StripeConfigPost(ctx).Config(config).Execute()

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
	resp, r, err := apiClient.StripeAPI.StripeConfigPost(context.Background()).Config(config).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StripeAPI.StripeConfigPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `StripeConfigPost`: HandlersSuccessResponse
	fmt.Fprintf(os.Stdout, "Response from `StripeAPI.StripeConfigPost`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiStripeConfigPostRequest struct via the builder pattern


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


## StripeConfigPullGet

> StripeConfigPullGet200Response StripeConfigPullGet(ctx).Execute()

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
	resp, r, err := apiClient.StripeAPI.StripeConfigPullGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StripeAPI.StripeConfigPullGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `StripeConfigPullGet`: StripeConfigPullGet200Response
	fmt.Fprintf(os.Stdout, "Response from `StripeAPI.StripeConfigPullGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiStripeConfigPullGetRequest struct via the builder pattern


### Return type

[**StripeConfigPullGet200Response**](StripeConfigPullGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## StripeConfigValidatePost

> HandlersSuccessResponse StripeConfigValidatePost(ctx).Config(config).Execute()

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
	resp, r, err := apiClient.StripeAPI.StripeConfigValidatePost(context.Background()).Config(config).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StripeAPI.StripeConfigValidatePost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `StripeConfigValidatePost`: HandlersSuccessResponse
	fmt.Fprintf(os.Stdout, "Response from `StripeAPI.StripeConfigValidatePost`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiStripeConfigValidatePostRequest struct via the builder pattern


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


## StripeSchemaGet

> map[string]interface{} StripeSchemaGet(ctx).Execute()

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
	resp, r, err := apiClient.StripeAPI.StripeSchemaGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `StripeAPI.StripeSchemaGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `StripeSchemaGet`: map[string]interface{}
	fmt.Fprintf(os.Stdout, "Response from `StripeAPI.StripeSchemaGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiStripeSchemaGetRequest struct via the builder pattern


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

