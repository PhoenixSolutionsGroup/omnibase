# ModelsActiveTenantResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**HasTenant** | **bool** |  | 
**Tenant** | Pointer to [**ModelsTenant**](ModelsTenant.md) |  | [optional] 

## Methods

### NewModelsActiveTenantResponse

`func NewModelsActiveTenantResponse(hasTenant bool, ) *ModelsActiveTenantResponse`

NewModelsActiveTenantResponse instantiates a new ModelsActiveTenantResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsActiveTenantResponseWithDefaults

`func NewModelsActiveTenantResponseWithDefaults() *ModelsActiveTenantResponse`

NewModelsActiveTenantResponseWithDefaults instantiates a new ModelsActiveTenantResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetHasTenant

`func (o *ModelsActiveTenantResponse) GetHasTenant() bool`

GetHasTenant returns the HasTenant field if non-nil, zero value otherwise.

### GetHasTenantOk

`func (o *ModelsActiveTenantResponse) GetHasTenantOk() (*bool, bool)`

GetHasTenantOk returns a tuple with the HasTenant field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHasTenant

`func (o *ModelsActiveTenantResponse) SetHasTenant(v bool)`

SetHasTenant sets HasTenant field to given value.


### GetTenant

`func (o *ModelsActiveTenantResponse) GetTenant() ModelsTenant`

GetTenant returns the Tenant field if non-nil, zero value otherwise.

### GetTenantOk

`func (o *ModelsActiveTenantResponse) GetTenantOk() (*ModelsTenant, bool)`

GetTenantOk returns a tuple with the Tenant field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenant

`func (o *ModelsActiveTenantResponse) SetTenant(v ModelsTenant)`

SetTenant sets Tenant field to given value.

### HasTenant

`func (o *ModelsActiveTenantResponse) HasTenant() bool`

HasTenant returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


