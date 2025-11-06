# TenantsCreateTenantResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | Pointer to **string** | Success message | [optional] 
**Tenant** | Pointer to [**ModelsTenant**](ModelsTenant.md) | Created tenant | [optional] 
**Token** | Pointer to **string** | JWT token with tenant context | [optional] 

## Methods

### NewTenantsCreateTenantResponse

`func NewTenantsCreateTenantResponse() *TenantsCreateTenantResponse`

NewTenantsCreateTenantResponse instantiates a new TenantsCreateTenantResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTenantsCreateTenantResponseWithDefaults

`func NewTenantsCreateTenantResponseWithDefaults() *TenantsCreateTenantResponse`

NewTenantsCreateTenantResponseWithDefaults instantiates a new TenantsCreateTenantResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMessage

`func (o *TenantsCreateTenantResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *TenantsCreateTenantResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *TenantsCreateTenantResponse) SetMessage(v string)`

SetMessage sets Message field to given value.

### HasMessage

`func (o *TenantsCreateTenantResponse) HasMessage() bool`

HasMessage returns a boolean if a field has been set.

### GetTenant

`func (o *TenantsCreateTenantResponse) GetTenant() ModelsTenant`

GetTenant returns the Tenant field if non-nil, zero value otherwise.

### GetTenantOk

`func (o *TenantsCreateTenantResponse) GetTenantOk() (*ModelsTenant, bool)`

GetTenantOk returns a tuple with the Tenant field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenant

`func (o *TenantsCreateTenantResponse) SetTenant(v ModelsTenant)`

SetTenant sets Tenant field to given value.

### HasTenant

`func (o *TenantsCreateTenantResponse) HasTenant() bool`

HasTenant returns a boolean if a field has been set.

### GetToken

`func (o *TenantsCreateTenantResponse) GetToken() string`

GetToken returns the Token field if non-nil, zero value otherwise.

### GetTokenOk

`func (o *TenantsCreateTenantResponse) GetTokenOk() (*string, bool)`

GetTokenOk returns a tuple with the Token field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetToken

`func (o *TenantsCreateTenantResponse) SetToken(v string)`

SetToken sets Token field to given value.

### HasToken

`func (o *TenantsCreateTenantResponse) HasToken() bool`

HasToken returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


