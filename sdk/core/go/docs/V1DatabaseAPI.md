# \V1DatabaseAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GenerateDatabaseTypes**](V1DatabaseAPI.md#GenerateDatabaseTypes) | **Get** /api/v1/database/typegen | Generate type definitions for the database schema
[**GetDatabaseMigrationStatus**](V1DatabaseAPI.md#GetDatabaseMigrationStatus) | **Get** /api/v1/database/migrations/status | Get the status of applied migrations
[**RollbackDatabaseMigrations**](V1DatabaseAPI.md#RollbackDatabaseMigrations) | **Post** /api/v1/database/migrations/down | Roll back database migrations
[**UploadDatabaseMigrations**](V1DatabaseAPI.md#UploadDatabaseMigrations) | **Post** /api/v1/database/migrations | Apply database migrations



## GenerateDatabaseTypes

> string GenerateDatabaseTypes(ctx).Language(language).Schemas(schemas).Execute()

Generate type definitions for the database schema

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
	language := "language_example" // string |  (optional) (default to "typescript")
	schemas := "schemas_example" // string |  (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1DatabaseAPI.GenerateDatabaseTypes(context.Background()).Language(language).Schemas(schemas).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1DatabaseAPI.GenerateDatabaseTypes``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GenerateDatabaseTypes`: string
	fmt.Fprintf(os.Stdout, "Response from `V1DatabaseAPI.GenerateDatabaseTypes`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiGenerateDatabaseTypesRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **language** | **string** |  | [default to &quot;typescript&quot;]
 **schemas** | **string** |  | 

### Return type

**string**

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetDatabaseMigrationStatus

> []AppliedMigration GetDatabaseMigrationStatus(ctx).Execute()

Get the status of applied migrations

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
	resp, r, err := apiClient.V1DatabaseAPI.GetDatabaseMigrationStatus(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1DatabaseAPI.GetDatabaseMigrationStatus``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetDatabaseMigrationStatus`: []AppliedMigration
	fmt.Fprintf(os.Stdout, "Response from `V1DatabaseAPI.GetDatabaseMigrationStatus`: %v\n", resp)
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
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## RollbackDatabaseMigrations

> MigrationsDownResponse RollbackDatabaseMigrations(ctx).Migrations(migrations).Steps(steps).Execute()

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
	migrations := os.NewFile(1234, "some_file") // *os.File | 
	steps := "steps_example" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1DatabaseAPI.RollbackDatabaseMigrations(context.Background()).Migrations(migrations).Steps(steps).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1DatabaseAPI.RollbackDatabaseMigrations``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `RollbackDatabaseMigrations`: MigrationsDownResponse
	fmt.Fprintf(os.Stdout, "Response from `V1DatabaseAPI.RollbackDatabaseMigrations`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiRollbackDatabaseMigrationsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **migrations** | ***os.File** |  | 
 **steps** | **string** |  | 

### Return type

[**MigrationsDownResponse**](MigrationsDownResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: multipart/form-data
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## UploadDatabaseMigrations

> ApplyMigrationsResponse UploadDatabaseMigrations(ctx).Migrations(migrations).Execute()

Apply database migrations

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
	migrations := os.NewFile(1234, "some_file") // *os.File | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1DatabaseAPI.UploadDatabaseMigrations(context.Background()).Migrations(migrations).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1DatabaseAPI.UploadDatabaseMigrations``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `UploadDatabaseMigrations`: ApplyMigrationsResponse
	fmt.Fprintf(os.Stdout, "Response from `V1DatabaseAPI.UploadDatabaseMigrations`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiUploadDatabaseMigrationsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **migrations** | ***os.File** |  | 

### Return type

[**ApplyMigrationsResponse**](ApplyMigrationsResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: multipart/form-data
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

