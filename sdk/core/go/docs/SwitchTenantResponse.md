# SwitchTenantResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | **string** | Success message | 
**Token** | **string** | New JWT token with updated tenant context | 

## Methods

### NewSwitchTenantResponse

`func NewSwitchTenantResponse(message string, token string, ) *SwitchTenantResponse`

NewSwitchTenantResponse instantiates a new SwitchTenantResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSwitchTenantResponseWithDefaults

`func NewSwitchTenantResponseWithDefaults() *SwitchTenantResponse`

NewSwitchTenantResponseWithDefaults instantiates a new SwitchTenantResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMessage

`func (o *SwitchTenantResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *SwitchTenantResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *SwitchTenantResponse) SetMessage(v string)`

SetMessage sets Message field to given value.


### GetToken

`func (o *SwitchTenantResponse) GetToken() string`

GetToken returns the Token field if non-nil, zero value otherwise.

### GetTokenOk

`func (o *SwitchTenantResponse) GetTokenOk() (*string, bool)`

GetTokenOk returns a tuple with the Token field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetToken

`func (o *SwitchTenantResponse) SetToken(v string)`

SetToken sets Token field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


