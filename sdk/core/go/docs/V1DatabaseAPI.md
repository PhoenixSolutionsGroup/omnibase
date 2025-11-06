# \V1DatabaseAPI

All URIs are relative to *http://https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**UploadDatabaseMigrations**](V1DatabaseAPI.md#UploadDatabaseMigrations) | **Post** /api/v1/database/migrations | Upload database migrations



## UploadDatabaseMigrations

> V1MigrationSuccessResponse UploadDatabaseMigrations(ctx).Migrations(migrations).Execute()

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
	resp, r, err := apiClient.V1DatabaseAPI.UploadDatabaseMigrations(context.Background()).Migrations(migrations).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1DatabaseAPI.UploadDatabaseMigrations``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `UploadDatabaseMigrations`: V1MigrationSuccessResponse
	fmt.Fprintf(os.Stdout, "Response from `V1DatabaseAPI.UploadDatabaseMigrations`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiUploadDatabaseMigrationsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **migrations** | ***os.File** | Zip file containing SQL migration files | 

### Return type

[**V1MigrationSuccessResponse**](V1MigrationSuccessResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: multipart/form-data
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

