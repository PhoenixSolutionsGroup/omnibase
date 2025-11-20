# AcceptInviteResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**TenantId** | **string** | Tenant ID the user joined | 
**Token** | **string** | New JWT token with tenant context | 
**Message** | **string** | Success message | 

## Methods

### NewAcceptInviteResponse

`func NewAcceptInviteResponse(tenantId string, token string, message string, ) *AcceptInviteResponse`

NewAcceptInviteResponse instantiates a new AcceptInviteResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAcceptInviteResponseWithDefaults

`func NewAcceptInviteResponseWithDefaults() *AcceptInviteResponse`

NewAcceptInviteResponseWithDefaults instantiates a new AcceptInviteResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetTenantId

`func (o *AcceptInviteResponse) GetTenantId() string`

GetTenantId returns the TenantId field if non-nil, zero value otherwise.

### GetTenantIdOk

`func (o *AcceptInviteResponse) GetTenantIdOk() (*string, bool)`

GetTenantIdOk returns a tuple with the TenantId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenantId

`func (o *AcceptInviteResponse) SetTenantId(v string)`

SetTenantId sets TenantId field to given value.


### GetToken

`func (o *AcceptInviteResponse) GetToken() string`

GetToken returns the Token field if non-nil, zero value otherwise.

### GetTokenOk

`func (o *AcceptInviteResponse) GetTokenOk() (*string, bool)`

GetTokenOk returns a tuple with the Token field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetToken

`func (o *AcceptInviteResponse) SetToken(v string)`

SetToken sets Token field to given value.


### GetMessage

`func (o *AcceptInviteResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *AcceptInviteResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *AcceptInviteResponse) SetMessage(v string)`

SetMessage sets Message field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


