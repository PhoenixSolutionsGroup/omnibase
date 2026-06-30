# \V1ConfigurationAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ArchiveAllStripeConfig**](V1ConfigurationAPI.md#ArchiveAllStripeConfig) | **Post** /api/v1/stripe/admin/config/archive-all | Archive all Stripe config
[**CreateOrUpdateEmailTemplate**](V1ConfigurationAPI.md#CreateOrUpdateEmailTemplate) | **Post** /api/v1/email/templates | Create or update email template
[**DeleteEmailTemplate**](V1ConfigurationAPI.md#DeleteEmailTemplate) | **Delete** /api/v1/email/templates/{type} | Delete email template
[**DeployPermissionNamespaces**](V1ConfigurationAPI.md#DeployPermissionNamespaces) | **Post** /api/v1/permissions/namespaces | Deploy Keto namespace configurations
[**GetEmailTemplates**](V1ConfigurationAPI.md#GetEmailTemplates) | **Get** /api/v1/email/templates | Get all email templates
[**GetStripeConfigHistory**](V1ConfigurationAPI.md#GetStripeConfigHistory) | **Get** /api/v1/stripe/admin/config/history | Get config history
[**GetStripeConfigSchema**](V1ConfigurationAPI.md#GetStripeConfigSchema) | **Get** /api/v1/stripe/schema | Get Stripe config schema
[**PullStripeConfig**](V1ConfigurationAPI.md#PullStripeConfig) | **Get** /api/v1/stripe/admin/config/pull | Pull config from Stripe
[**SendEmail**](V1ConfigurationAPI.md#SendEmail) | **Post** /api/v1/email/send | Send an email
[**ServeEmailTemplate**](V1ConfigurationAPI.md#ServeEmailTemplate) | **Get** /api/v1/email/templates/{template_name}/{type} | Serve an email template file
[**UpdateStripeConfig**](V1ConfigurationAPI.md#UpdateStripeConfig) | **Post** /api/v1/stripe/admin/config | Update Stripe config
[**ValidateStripeConfig**](V1ConfigurationAPI.md#ValidateStripeConfig) | **Post** /api/v1/stripe/admin/config/validate | Validate Stripe config



## ArchiveAllStripeConfig

> ArchiveAllResponse ArchiveAllStripeConfig(ctx).Execute()

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
	resp, r, err := apiClient.V1ConfigurationAPI.ArchiveAllStripeConfig(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.ArchiveAllStripeConfig``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ArchiveAllStripeConfig`: ArchiveAllResponse
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.ArchiveAllStripeConfig`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiArchiveAllStripeConfigRequest struct via the builder pattern


### Return type

[**ArchiveAllResponse**](ArchiveAllResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateOrUpdateEmailTemplate

> UpsertTemplateResponse CreateOrUpdateEmailTemplate(ctx).UpsertTemplateRequest(upsertTemplateRequest).Execute()

Create or update email template

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
	upsertTemplateRequest := *openapiclient.NewUpsertTemplateRequest("HtmlBody_example", "Subject_example", "Type_example") // UpsertTemplateRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1ConfigurationAPI.CreateOrUpdateEmailTemplate(context.Background()).UpsertTemplateRequest(upsertTemplateRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.CreateOrUpdateEmailTemplate``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateOrUpdateEmailTemplate`: UpsertTemplateResponse
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.CreateOrUpdateEmailTemplate`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateOrUpdateEmailTemplateRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **upsertTemplateRequest** | [**UpsertTemplateRequest**](UpsertTemplateRequest.md) |  | 

### Return type

[**UpsertTemplateResponse**](UpsertTemplateResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DeleteEmailTemplate

> DeleteTemplateResponse DeleteEmailTemplate(ctx, type_).Execute()

Delete email template

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
	type_ := "type__example" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1ConfigurationAPI.DeleteEmailTemplate(context.Background(), type_).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.DeleteEmailTemplate``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `DeleteEmailTemplate`: DeleteTemplateResponse
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.DeleteEmailTemplate`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**type_** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiDeleteEmailTemplateRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**DeleteTemplateResponse**](DeleteTemplateResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DeployPermissionNamespaces

> DeployNamespacesResponse DeployPermissionNamespaces(ctx).Namespaces(namespaces).Execute()

Deploy Keto namespace configurations

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
	namespaces := os.NewFile(1234, "some_file") // *os.File | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1ConfigurationAPI.DeployPermissionNamespaces(context.Background()).Namespaces(namespaces).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.DeployPermissionNamespaces``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `DeployPermissionNamespaces`: DeployNamespacesResponse
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.DeployPermissionNamespaces`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiDeployPermissionNamespacesRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **namespaces** | ***os.File** |  | 

### Return type

[**DeployNamespacesResponse**](DeployNamespacesResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: multipart/form-data
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetEmailTemplates

> ListTemplatesResponse GetEmailTemplates(ctx).Execute()

Get all email templates

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
	resp, r, err := apiClient.V1ConfigurationAPI.GetEmailTemplates(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.GetEmailTemplates``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetEmailTemplates`: ListTemplatesResponse
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.GetEmailTemplates`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetEmailTemplatesRequest struct via the builder pattern


### Return type

[**ListTemplatesResponse**](ListTemplatesResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetStripeConfigHistory

> ConfigHistoryResponse GetStripeConfigHistory(ctx).Limit(limit).Offset(offset).Execute()

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
	limit := int64(789) // int64 |  (optional) (default to 10)
	offset := int64(789) // int64 |  (optional) (default to 0)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1ConfigurationAPI.GetStripeConfigHistory(context.Background()).Limit(limit).Offset(offset).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.GetStripeConfigHistory``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetStripeConfigHistory`: ConfigHistoryResponse
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.GetStripeConfigHistory`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiGetStripeConfigHistoryRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **int64** |  | [default to 10]
 **offset** | **int64** |  | [default to 0]

### Return type

[**ConfigHistoryResponse**](ConfigHistoryResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetStripeConfigSchema

> string GetStripeConfigSchema(ctx).Execute()

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
	resp, r, err := apiClient.V1ConfigurationAPI.GetStripeConfigSchema(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.GetStripeConfigSchema``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetStripeConfigSchema`: string
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.GetStripeConfigSchema`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetStripeConfigSchemaRequest struct via the builder pattern


### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## PullStripeConfig

> StripeConfiguration PullStripeConfig(ctx).Execute()

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
	resp, r, err := apiClient.V1ConfigurationAPI.PullStripeConfig(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.PullStripeConfig``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `PullStripeConfig`: StripeConfiguration
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.PullStripeConfig`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiPullStripeConfigRequest struct via the builder pattern


### Return type

[**StripeConfiguration**](StripeConfiguration.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## SendEmail

> SendResponse SendEmail(ctx).SendRequest(sendRequest).Execute()

Send an email

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
	sendRequest := *openapiclient.NewSendRequest("Body_example", "Subject_example", "To_example") // SendRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1ConfigurationAPI.SendEmail(context.Background()).SendRequest(sendRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.SendEmail``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `SendEmail`: SendResponse
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.SendEmail`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiSendEmailRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **sendRequest** | [**SendRequest**](SendRequest.md) |  | 

### Return type

[**SendResponse**](SendResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ServeEmailTemplate

> string ServeEmailTemplate(ctx, templateName, type_).Execute()

Serve an email template file

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
	templateName := "templateName_example" // string | 
	type_ := "type__example" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1ConfigurationAPI.ServeEmailTemplate(context.Background(), templateName, type_).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.ServeEmailTemplate``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ServeEmailTemplate`: string
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.ServeEmailTemplate`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**templateName** | **string** |  | 
**type_** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiServeEmailTemplateRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------



### Return type

**string**

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## UpdateStripeConfig

> ConfigResponse UpdateStripeConfig(ctx).Body(body).Execute()

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
	body := map[string]interface{}{ ... } // map[string]interface{} | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1ConfigurationAPI.UpdateStripeConfig(context.Background()).Body(body).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.UpdateStripeConfig``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `UpdateStripeConfig`: ConfigResponse
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.UpdateStripeConfig`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiUpdateStripeConfigRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | **map[string]interface{}** |  | 

### Return type

[**ConfigResponse**](ConfigResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ValidateStripeConfig

> string ValidateStripeConfig(ctx).Body(body).Execute()

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
	body := map[string]interface{}{ ... } // map[string]interface{} | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1ConfigurationAPI.ValidateStripeConfig(context.Background()).Body(body).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.ValidateStripeConfig``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ValidateStripeConfig`: string
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.ValidateStripeConfig`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiValidateStripeConfigRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | **map[string]interface{}** |  | 

### Return type

**string**

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

