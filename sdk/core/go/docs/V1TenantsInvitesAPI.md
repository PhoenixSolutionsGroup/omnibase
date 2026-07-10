# \V1TenantsInvitesAPI

All URIs are relative to *https://api.omnibase.tech*

Method | HTTP request | Description
------------- | ------------- | -------------
[**AcceptInvite**](V1TenantsInvitesAPI.md#AcceptInvite) | **Put** /api/v1/tenants/invites/accept | Accept a tenant invite
[**CreateInvite**](V1TenantsInvitesAPI.md#CreateInvite) | **Post** /api/v1/tenants/invites | Create a tenant invite



## AcceptInvite

> AcceptResponse AcceptInvite(ctx).AcceptRequest(acceptRequest).Execute()

Accept a tenant invite

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
	acceptRequest := *openapiclient.NewAcceptRequest("Token_example") // AcceptRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsInvitesAPI.AcceptInvite(context.Background()).AcceptRequest(acceptRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsInvitesAPI.AcceptInvite``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `AcceptInvite`: AcceptResponse
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsInvitesAPI.AcceptInvite`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiAcceptInviteRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **acceptRequest** | [**AcceptRequest**](AcceptRequest.md) |  | 

### Return type

[**AcceptResponse**](AcceptResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## CreateInvite

> CreateResponse CreateInvite(ctx).CreateRequest(createRequest).Execute()

Create a tenant invite

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
	createRequest := *openapiclient.NewCreateRequest("Email_example", "InviteUrl_example", "Role_example") // CreateRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.V1TenantsInvitesAPI.CreateInvite(context.Background()).CreateRequest(createRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `V1TenantsInvitesAPI.CreateInvite``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateInvite`: CreateResponse
	fmt.Fprintf(os.Stdout, "Response from `V1TenantsInvitesAPI.CreateInvite`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateInviteRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createRequest** | [**CreateRequest**](CreateRequest.md) |  | 

### Return type

[**CreateResponse**](CreateResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

