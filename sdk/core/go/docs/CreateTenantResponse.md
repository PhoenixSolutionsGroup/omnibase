# CreateTenantResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | **string** | Success message | 
**Tenant** | [**Tenant**](Tenant.md) |  | 
**Token** | **string** | JWT token with tenant context | 

## Methods

### NewCreateTenantResponse

`func NewCreateTenantResponse(message string, tenant Tenant, token string, ) *CreateTenantResponse`

NewCreateTenantResponse instantiates a new CreateTenantResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateTenantResponseWithDefaults

`func NewCreateTenantResponseWithDefaults() *CreateTenantResponse`

NewCreateTenantResponseWithDefaults instantiates a new CreateTenantResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMessage

`func (o *CreateTenantResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *CreateTenantResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *CreateTenantResponse) SetMessage(v string)`

SetMessage sets Message field to given value.


### GetTenant

`func (o *CreateTenantResponse) GetTenant() Tenant`

GetTenant returns the Tenant field if non-nil, zero value otherwise.

### GetTenantOk

`func (o *CreateTenantResponse) GetTenantOk() (*Tenant, bool)`

GetTenantOk returns a tuple with the Tenant field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenant

`func (o *CreateTenantResponse) SetTenant(v Tenant)`

SetTenant sets Tenant field to given value.


### GetToken

`func (o *CreateTenantResponse) GetToken() string`

GetToken returns the Token field if non-nil, zero value otherwise.

### GetTokenOk

`func (o *CreateTenantResponse) GetTokenOk() (*string, bool)`

GetTokenOk returns a tuple with the Token field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetToken

`func (o *CreateTenantResponse) SetToken(v string)`

SetToken sets Token field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


