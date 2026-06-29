# \V1ConfigurationAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ArchiveAllStripeConfig**](V1ConfigurationAPI.md#ArchiveAllStripeConfig) | **Post** /api/v1/stripe/admin/config/archive-all | Archive all Stripe config
[**CreateOrUpdateEmailTemplate**](V1ConfigurationAPI.md#CreateOrUpdateEmailTemplate) | **Post** /api/v1/email/templates | Create or update email template
[**DeleteEmailTemplate**](V1ConfigurationAPI.md#DeleteEmailTemplate) | **Delete** /api/v1/email/templates/{type} | Delete email template
[**DeployPermissionNamespaces**](V1ConfigurationAPI.md#DeployPermissionNamespaces) | **Post** /api/v1/permissions/namespaces | Deploy Keto namespace configurations
[**GenerateDatabaseTypes**](V1ConfigurationAPI.md#GenerateDatabaseTypes) | **Get** /api/v1/database/typegen | Generate types from database schema
[**GetDatabaseMigrationStatus**](V1ConfigurationAPI.md#GetDatabaseMigrationStatus) | **Get** /api/v1/database/migrations/status | Get applied migration status
[**GetEmailTemplates**](V1ConfigurationAPI.md#GetEmailTemplates) | **Get** /api/v1/email/templates | Get all email templates
[**GetStripeConfigHistory**](V1ConfigurationAPI.md#GetStripeConfigHistory) | **Get** /api/v1/stripe/admin/config/history | Get config history
[**GetStripeConfigSchema**](V1ConfigurationAPI.md#GetStripeConfigSchema) | **Get** /api/v1/stripe/schema | Get Stripe config schema
[**PullStripeConfig**](V1ConfigurationAPI.md#PullStripeConfig) | **Get** /api/v1/stripe/admin/config/pull | Pull config from Stripe
[**RollbackDatabaseMigrations**](V1ConfigurationAPI.md#RollbackDatabaseMigrations) | **Post** /api/v1/database/migrations/down | Roll back database migrations
[**SendEmail**](V1ConfigurationAPI.md#SendEmail) | **Post** /api/v1/email/send | Send an email
[**ServeEmailTemplate**](V1ConfigurationAPI.md#ServeEmailTemplate) | **Get** /api/v1/email/templates/{template_name}/{type} | Serve an email template file
[**UpdateStripeConfig**](V1ConfigurationAPI.md#UpdateStripeConfig) | **Post** /api/v1/stripe/admin/config | Update Stripe config
[**UploadDatabaseMigrations**](V1ConfigurationAPI.md#UploadDatabaseMigrations) | **Post** /api/v1/database/migrations | Upload database migrations
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
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateOrUpdateEmailTemplate

> CreateOrUpdateEmailTemplate200Response CreateOrUpdateEmailTemplate(ctx).CreateEmailTemplateRequest(createEmailTemplateRequest).Execute()

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
	createEmailTemplateRequest := *openapiclient.NewCreateEmailTemplateRequest("test_welcome", "Welcome to Test Platform", "<h1>Welcome!</h1><p>Thanks for joining our test platform.</p>") // CreateEmailTemplateRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1ConfigurationAPI.CreateOrUpdateEmailTemplate(context.Background()).CreateEmailTemplateRequest(createEmailTemplateRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.CreateOrUpdateEmailTemplate``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateOrUpdateEmailTemplate`: CreateOrUpdateEmailTemplate200Response
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.CreateOrUpdateEmailTemplate`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateOrUpdateEmailTemplateRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createEmailTemplateRequest** | [**CreateEmailTemplateRequest**](CreateEmailTemplateRequest.md) |  | 

### Return type

[**CreateOrUpdateEmailTemplate200Response**](CreateOrUpdateEmailTemplate200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DeleteEmailTemplate

> DeleteEmailTemplate200Response DeleteEmailTemplate(ctx, type_).Execute()

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
	type_ := "welcome" // string | Template type identifier

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1ConfigurationAPI.DeleteEmailTemplate(context.Background(), type_).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.DeleteEmailTemplate``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `DeleteEmailTemplate`: DeleteEmailTemplate200Response
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.DeleteEmailTemplate`: %v\n", resp)
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**type_** | **string** | Template type identifier | 

### Other Parameters

Other parameters are passed through a pointer to a apiDeleteEmailTemplateRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


### Return type

[**DeleteEmailTemplate200Response**](DeleteEmailTemplate200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## DeployPermissionNamespaces

> NamespaceDeploymentResponse DeployPermissionNamespaces(ctx).Namespaces(namespaces).Execute()

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
	namespaces := os.NewFile(1234, "some_file") // *os.File | Zip file containing namespace configuration files

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1ConfigurationAPI.DeployPermissionNamespaces(context.Background()).Namespaces(namespaces).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.DeployPermissionNamespaces``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `DeployPermissionNamespaces`: NamespaceDeploymentResponse
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.DeployPermissionNamespaces`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiDeployPermissionNamespacesRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **namespaces** | ***os.File** | Zip file containing namespace configuration files | 

### Return type

[**NamespaceDeploymentResponse**](NamespaceDeploymentResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: multipart/form-data
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GenerateDatabaseTypes

> string GenerateDatabaseTypes(ctx).Schemas(schemas).Language(language).Execute()

Generate types from database schema



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
	schemas := "public,auth" // string | Comma-separated list of database schemas to include (valid PostgreSQL identifiers) (optional) (default to "public")
	language := "typescript" // string | Target language for type generation (optional) (default to "typescript")

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1ConfigurationAPI.GenerateDatabaseTypes(context.Background()).Schemas(schemas).Language(language).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.GenerateDatabaseTypes``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GenerateDatabaseTypes`: string
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.GenerateDatabaseTypes`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiGenerateDatabaseTypesRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **schemas** | **string** | Comma-separated list of database schemas to include (valid PostgreSQL identifiers) | [default to &quot;public&quot;]
 **language** | **string** | Target language for type generation | [default to &quot;typescript&quot;]

### Return type

**string**

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/plain, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetDatabaseMigrationStatus

> []AppliedMigration GetDatabaseMigrationStatus(ctx).Execute()

Get applied migration status



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
	resp, r, err := apiClient.V1ConfigurationAPI.GetDatabaseMigrationStatus(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.GetDatabaseMigrationStatus``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetDatabaseMigrationStatus`: []AppliedMigration
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.GetDatabaseMigrationStatus`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetDatabaseMigrationStatusRequest struct via the builder pattern


### Return type

[**[]AppliedMigration**](AppliedMigration.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetEmailTemplates

> GetEmailTemplates200Response GetEmailTemplates(ctx).Execute()

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
	// response from `GetEmailTemplates`: GetEmailTemplates200Response
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.GetEmailTemplates`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetEmailTemplatesRequest struct via the builder pattern


### Return type

[**GetEmailTemplates200Response**](GetEmailTemplates200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, text/plain

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
	limit := int32(56) // int32 | Items per page (optional) (default to 10)
	offset := int32(56) // int32 | Items to skip (optional) (default to 0)

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
 **limit** | **int32** | Items per page | [default to 10]
 **offset** | **int32** | Items to skip | [default to 0]

### Return type

[**ConfigHistoryResponse**](ConfigHistoryResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

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
	resp, r, err := apiClient.V1ConfigurationAPI.GetStripeConfigSchema(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.GetStripeConfigSchema``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetStripeConfigSchema`: map[string]interface{}
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.GetStripeConfigSchema`: %v\n", resp)
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
- **Accept**: application/schema+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## PullStripeConfig

> StripeConfigurationWithIDs PullStripeConfig(ctx).Execute()

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
	// response from `PullStripeConfig`: StripeConfigurationWithIDs
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.PullStripeConfig`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiPullStripeConfigRequest struct via the builder pattern


### Return type

[**StripeConfigurationWithIDs**](StripeConfigurationWithIDs.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## RollbackDatabaseMigrations

> RollbackDatabaseMigrations200Response RollbackDatabaseMigrations(ctx).Steps(steps).Migrations(migrations).Execute()

Roll back database migrations



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
	steps := int32(56) // int32 | Number of migrations to roll back
	migrations := os.NewFile(1234, "some_file") // *os.File | Zip file containing SQL migration files

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1ConfigurationAPI.RollbackDatabaseMigrations(context.Background()).Steps(steps).Migrations(migrations).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.RollbackDatabaseMigrations``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `RollbackDatabaseMigrations`: RollbackDatabaseMigrations200Response
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.RollbackDatabaseMigrations`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiRollbackDatabaseMigrationsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **steps** | **int32** | Number of migrations to roll back | 
 **migrations** | ***os.File** | Zip file containing SQL migration files | 

### Return type

[**RollbackDatabaseMigrations200Response**](RollbackDatabaseMigrations200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: multipart/form-data
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## SendEmail

> SendEmail200Response SendEmail(ctx).SendEmailRequest(sendEmailRequest).Execute()

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
	sendEmailRequest := *openapiclient.NewSendEmailRequest("user@example.com", "Welcome to Our Platform", "<h1>Hello!</h1><p>Welcome to our platform.</p>") // SendEmailRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1ConfigurationAPI.SendEmail(context.Background()).SendEmailRequest(sendEmailRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.SendEmail``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `SendEmail`: SendEmail200Response
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.SendEmail`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiSendEmailRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **sendEmailRequest** | [**SendEmailRequest**](SendEmailRequest.md) |  | 

### Return type

[**SendEmail200Response**](SendEmail200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

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
	templateName := "verification" // string | Kratos flow/template name
	type_ := "body" // string | Which part of the template to serve

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
**templateName** | **string** | Kratos flow/template name | 
**type_** | **string** | Which part of the template to serve | 

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
- **Accept**: text/plain, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## UpdateStripeConfig

> StripeConfigUpdateResponse UpdateStripeConfig(ctx).StripeConfigUpdateRequest(stripeConfigUpdateRequest).Execute()

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
	stripeConfigUpdateRequest := *openapiclient.NewStripeConfigUpdateRequest("1.0.0", []openapiclient.Product{*openapiclient.NewProduct("basic_plan", "Basic Plan", []openapiclient.Price{openapiclient.Price{PerUnitPrice: openapiclient.NewPerUnitPrice("basic_monthly", float64(0.273), openapiclient.CurrencyCode("usd"))}})}) // StripeConfigUpdateRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1ConfigurationAPI.UpdateStripeConfig(context.Background()).StripeConfigUpdateRequest(stripeConfigUpdateRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.UpdateStripeConfig``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `UpdateStripeConfig`: StripeConfigUpdateResponse
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.UpdateStripeConfig`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiUpdateStripeConfigRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **stripeConfigUpdateRequest** | [**StripeConfigUpdateRequest**](StripeConfigUpdateRequest.md) |  | 

### Return type

[**StripeConfigUpdateResponse**](StripeConfigUpdateResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## UploadDatabaseMigrations

> map[string]interface{} UploadDatabaseMigrations(ctx).Migrations(migrations).Execute()

Upload database migrations



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
	migrations := os.NewFile(1234, "some_file") // *os.File | Zip file containing SQL migration files

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1ConfigurationAPI.UploadDatabaseMigrations(context.Background()).Migrations(migrations).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.UploadDatabaseMigrations``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `UploadDatabaseMigrations`: map[string]interface{}
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.UploadDatabaseMigrations`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiUploadDatabaseMigrationsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **migrations** | ***os.File** | Zip file containing SQL migration files | 

### Return type

**map[string]interface{}**

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: multipart/form-data
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ValidateStripeConfig

> map[string]interface{} ValidateStripeConfig(ctx).StripeConfigValidateRequest(stripeConfigValidateRequest).Execute()

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
	stripeConfigValidateRequest := *openapiclient.NewStripeConfigValidateRequest("1.0.0", []openapiclient.Product{*openapiclient.NewProduct("basic_plan", "Basic Plan", []openapiclient.Price{openapiclient.Price{PerUnitPrice: openapiclient.NewPerUnitPrice("basic_monthly", float64(0.273), openapiclient.CurrencyCode("usd"))}})}) // StripeConfigValidateRequest | Stripe configuration to validate

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1ConfigurationAPI.ValidateStripeConfig(context.Background()).StripeConfigValidateRequest(stripeConfigValidateRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1ConfigurationAPI.ValidateStripeConfig``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ValidateStripeConfig`: map[string]interface{}
	fmt.Fprintf(os.Stdout, "Response from `V1ConfigurationAPI.ValidateStripeConfig`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiValidateStripeConfigRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **stripeConfigValidateRequest** | [**StripeConfigValidateRequest**](StripeConfigValidateRequest.md) | Stripe configuration to validate | 

### Return type

**map[string]interface{}**

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

