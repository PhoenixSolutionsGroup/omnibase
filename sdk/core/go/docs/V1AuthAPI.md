# \V1AuthAPI

All URIs are relative to *http://https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ApiV1AuthActiveTenantGet**](V1AuthAPI.md#ApiV1AuthActiveTenantGet) | **Get** /api/v1/auth/active-tenant | Get active tenant
[**ApiV1AuthIdentityGet**](V1AuthAPI.md#ApiV1AuthIdentityGet) | **Get** /api/v1/auth/identity | Get current identity
[**ApiV1AuthLogoutPost**](V1AuthAPI.md#ApiV1AuthLogoutPost) | **Post** /api/v1/auth/logout | Logout user
[**ApiV1AuthSessionGet**](V1AuthAPI.md#ApiV1AuthSessionGet) | **Get** /api/v1/auth/session | Get current session
[**ApiV1AuthWhoamiGet**](V1AuthAPI.md#ApiV1AuthWhoamiGet) | **Get** /api/v1/auth/whoami | Check authentication status



## ApiV1AuthActiveTenantGet

> ApiV1AuthActiveTenantGet200Response ApiV1AuthActiveTenantGet(ctx).Execute()

Get active tenant



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
	resp, r, err := apiClient.V1AuthAPI.ApiV1AuthActiveTenantGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1AuthAPI.ApiV1AuthActiveTenantGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ApiV1AuthActiveTenantGet`: ApiV1AuthActiveTenantGet200Response
	fmt.Fprintf(os.Stdout, "Response from `V1AuthAPI.ApiV1AuthActiveTenantGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiApiV1AuthActiveTenantGetRequest struct via the builder pattern


### Return type

[**ApiV1AuthActiveTenantGet200Response**](ApiV1AuthActiveTenantGet200Response.md)

### Authorization

[SessionAuth](../README.md#SessionAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ApiV1AuthIdentityGet

> ApiV1AuthIdentityGet200Response ApiV1AuthIdentityGet(ctx).Execute()

Get current identity



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
	resp, r, err := apiClient.V1AuthAPI.ApiV1AuthIdentityGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1AuthAPI.ApiV1AuthIdentityGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ApiV1AuthIdentityGet`: ApiV1AuthIdentityGet200Response
	fmt.Fprintf(os.Stdout, "Response from `V1AuthAPI.ApiV1AuthIdentityGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiApiV1AuthIdentityGetRequest struct via the builder pattern


### Return type

[**ApiV1AuthIdentityGet200Response**](ApiV1AuthIdentityGet200Response.md)

### Authorization

[SessionAuth](../README.md#SessionAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ApiV1AuthLogoutPost

> ApiV1AuthLogoutPost200Response ApiV1AuthLogoutPost(ctx).Execute()

Logout user



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
	resp, r, err := apiClient.V1AuthAPI.ApiV1AuthLogoutPost(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1AuthAPI.ApiV1AuthLogoutPost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ApiV1AuthLogoutPost`: ApiV1AuthLogoutPost200Response
	fmt.Fprintf(os.Stdout, "Response from `V1AuthAPI.ApiV1AuthLogoutPost`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiApiV1AuthLogoutPostRequest struct via the builder pattern


### Return type

[**ApiV1AuthLogoutPost200Response**](ApiV1AuthLogoutPost200Response.md)

### Authorization

[SessionAuth](../README.md#SessionAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ApiV1AuthSessionGet

> ApiV1AuthSessionGet200Response ApiV1AuthSessionGet(ctx).Execute()

Get current session



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
	resp, r, err := apiClient.V1AuthAPI.ApiV1AuthSessionGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1AuthAPI.ApiV1AuthSessionGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ApiV1AuthSessionGet`: ApiV1AuthSessionGet200Response
	fmt.Fprintf(os.Stdout, "Response from `V1AuthAPI.ApiV1AuthSessionGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiApiV1AuthSessionGetRequest struct via the builder pattern


### Return type

[**ApiV1AuthSessionGet200Response**](ApiV1AuthSessionGet200Response.md)

### Authorization

[SessionAuth](../README.md#SessionAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ApiV1AuthWhoamiGet

> ApiV1AuthWhoamiGet200Response ApiV1AuthWhoamiGet(ctx).Execute()

Check authentication status



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
	resp, r, err := apiClient.V1AuthAPI.ApiV1AuthWhoamiGet(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1AuthAPI.ApiV1AuthWhoamiGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ApiV1AuthWhoamiGet`: ApiV1AuthWhoamiGet200Response
	fmt.Fprintf(os.Stdout, "Response from `V1AuthAPI.ApiV1AuthWhoamiGet`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiApiV1AuthWhoamiGetRequest struct via the builder pattern


### Return type

[**ApiV1AuthWhoamiGet200Response**](ApiV1AuthWhoamiGet200Response.md)

### Authorization

[SessionAuth](../README.md#SessionAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

