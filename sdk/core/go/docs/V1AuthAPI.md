# \V1AuthAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateUser**](V1AuthAPI.md#CreateUser) | **Post** /api/v1/auth/users | Create new user
[**GetActiveTenant**](V1AuthAPI.md#GetActiveTenant) | **Get** /api/v1/auth/active-tenant | Get active tenant
[**GetIdentity**](V1AuthAPI.md#GetIdentity) | **Get** /api/v1/auth/identity | Get current identity
[**GetSession**](V1AuthAPI.md#GetSession) | **Get** /api/v1/auth/session | Get current session
[**ListTenants**](V1AuthAPI.md#ListTenants) | **Get** /api/v1/auth/tenants | List user&#39;s tenants
[**Logout**](V1AuthAPI.md#Logout) | **Post** /api/v1/auth/logout | Logout user
[**WhoAmI**](V1AuthAPI.md#WhoAmI) | **Get** /api/v1/auth/whoami | Check authentication status



## CreateUser

> KratosIdentity CreateUser(ctx).CreateUserRequest(createUserRequest).Execute()

Create new user



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
	createUserRequest := *openapiclient.NewCreateUserRequest("user@example.com", "securepassword123", *openapiclient.NewCreateUserRequestName("John", "Doe")) // CreateUserRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1AuthAPI.CreateUser(context.Background()).CreateUserRequest(createUserRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1AuthAPI.CreateUser``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateUser`: KratosIdentity
	fmt.Fprintf(os.Stdout, "Response from `V1AuthAPI.CreateUser`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateUserRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createUserRequest** | [**CreateUserRequest**](CreateUserRequest.md) |  | 

### Return type

[**KratosIdentity**](KratosIdentity.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetActiveTenant

> ActiveTenantResponse GetActiveTenant(ctx).XUserId(xUserId).Execute()

Get active tenant



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
	xUserId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | User ID (UUID) - Required when using X-Service-Key header (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1AuthAPI.GetActiveTenant(context.Background()).XUserId(xUserId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1AuthAPI.GetActiveTenant``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetActiveTenant`: ActiveTenantResponse
	fmt.Fprintf(os.Stdout, "Response from `V1AuthAPI.GetActiveTenant`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiGetActiveTenantRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xUserId** | **string** | User ID (UUID) - Required when using X-Service-Key header | 

### Return type

[**ActiveTenantResponse**](ActiveTenantResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetIdentity

> map[string]interface{} GetIdentity(ctx).Execute()

Get current identity



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
	resp, r, err := apiClient.V1AuthAPI.GetIdentity(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1AuthAPI.GetIdentity``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetIdentity`: map[string]interface{}
	fmt.Fprintf(os.Stdout, "Response from `V1AuthAPI.GetIdentity`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetIdentityRequest struct via the builder pattern


### Return type

**map[string]interface{}**

### Authorization

[CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## GetSession

> SessionResponse GetSession(ctx).Execute()

Get current session



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
	resp, r, err := apiClient.V1AuthAPI.GetSession(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1AuthAPI.GetSession``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `GetSession`: SessionResponse
	fmt.Fprintf(os.Stdout, "Response from `V1AuthAPI.GetSession`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiGetSessionRequest struct via the builder pattern


### Return type

[**SessionResponse**](SessionResponse.md)

### Authorization

[CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListTenants

> ListTenantsResponse ListTenants(ctx).XUserId(xUserId).Execute()

List user's tenants



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
	xUserId := "38400000-8cf0-11bd-b23e-10b96e4ef00d" // string | User ID (UUID) - Required when using X-Service-Key header (optional)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1AuthAPI.ListTenants(context.Background()).XUserId(xUserId).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1AuthAPI.ListTenants``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListTenants`: ListTenantsResponse
	fmt.Fprintf(os.Stdout, "Response from `V1AuthAPI.ListTenants`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiListTenantsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xUserId** | **string** | User ID (UUID) - Required when using X-Service-Key header | 

### Return type

[**ListTenantsResponse**](ListTenantsResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## Logout

> LogoutResponse Logout(ctx).Execute()

Logout user



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
	resp, r, err := apiClient.V1AuthAPI.Logout(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1AuthAPI.Logout``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `Logout`: LogoutResponse
	fmt.Fprintf(os.Stdout, "Response from `V1AuthAPI.Logout`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiLogoutRequest struct via the builder pattern


### Return type

[**LogoutResponse**](LogoutResponse.md)

### Authorization

[CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## WhoAmI

> WhoAmIResponse WhoAmI(ctx).Execute()

Check authentication status



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
	resp, r, err := apiClient.V1AuthAPI.WhoAmI(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1AuthAPI.WhoAmI``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `WhoAmI`: WhoAmIResponse
	fmt.Fprintf(os.Stdout, "Response from `V1AuthAPI.WhoAmI`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiWhoAmIRequest struct via the builder pattern


### Return type

[**WhoAmIResponse**](WhoAmIResponse.md)

### Authorization

[CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json, text/plain

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

