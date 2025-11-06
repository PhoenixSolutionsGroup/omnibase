# TenantsSwitchTenantResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | **string** | Success message | 
**Token** | **string** | New JWT token with updated tenant context | 

## Methods

### NewTenantsSwitchTenantResponse

`func NewTenantsSwitchTenantResponse(message string, token string, ) *TenantsSwitchTenantResponse`

NewTenantsSwitchTenantResponse instantiates a new TenantsSwitchTenantResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTenantsSwitchTenantResponseWithDefaults

`func NewTenantsSwitchTenantResponseWithDefaults() *TenantsSwitchTenantResponse`

NewTenantsSwitchTenantResponseWithDefaults instantiates a new TenantsSwitchTenantResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMessage

`func (o *TenantsSwitchTenantResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *TenantsSwitchTenantResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *TenantsSwitchTenantResponse) SetMessage(v string)`

SetMessage sets Message field to given value.


### GetToken

`func (o *TenantsSwitchTenantResponse) GetToken() string`

GetToken returns the Token field if non-nil, zero value otherwise.

### GetTokenOk

`func (o *TenantsSwitchTenantResponse) GetTokenOk() (*string, bool)`

GetTokenOk returns a tuple with the Token field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetToken

`func (o *TenantsSwitchTenantResponse) SetToken(v string)`

SetToken sets Token field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


