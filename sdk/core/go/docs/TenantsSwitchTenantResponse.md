# TenantsSwitchTenantResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | Pointer to **string** | Success message | [optional] 
**Token** | Pointer to **string** | New JWT token with updated tenant context | [optional] 

## Methods

### NewTenantsSwitchTenantResponse

`func NewTenantsSwitchTenantResponse() *TenantsSwitchTenantResponse`

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

### HasMessage

`func (o *TenantsSwitchTenantResponse) HasMessage() bool`

HasMessage returns a boolean if a field has been set.

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

### HasToken

`func (o *TenantsSwitchTenantResponse) HasToken() bool`

HasToken returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


