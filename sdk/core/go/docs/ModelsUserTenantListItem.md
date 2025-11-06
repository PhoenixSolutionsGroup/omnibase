# ModelsUserTenantListItem

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**IsActive** | **bool** |  | 
**Tenant** | [**ModelsTenant**](ModelsTenant.md) |  | 

## Methods

### NewModelsUserTenantListItem

`func NewModelsUserTenantListItem(isActive bool, tenant ModelsTenant, ) *ModelsUserTenantListItem`

NewModelsUserTenantListItem instantiates a new ModelsUserTenantListItem object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsUserTenantListItemWithDefaults

`func NewModelsUserTenantListItemWithDefaults() *ModelsUserTenantListItem`

NewModelsUserTenantListItemWithDefaults instantiates a new ModelsUserTenantListItem object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetIsActive

`func (o *ModelsUserTenantListItem) GetIsActive() bool`

GetIsActive returns the IsActive field if non-nil, zero value otherwise.

### GetIsActiveOk

`func (o *ModelsUserTenantListItem) GetIsActiveOk() (*bool, bool)`

GetIsActiveOk returns a tuple with the IsActive field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIsActive

`func (o *ModelsUserTenantListItem) SetIsActive(v bool)`

SetIsActive sets IsActive field to given value.


### GetTenant

`func (o *ModelsUserTenantListItem) GetTenant() ModelsTenant`

GetTenant returns the Tenant field if non-nil, zero value otherwise.

### GetTenantOk

`func (o *ModelsUserTenantListItem) GetTenantOk() (*ModelsTenant, bool)`

GetTenantOk returns a tuple with the Tenant field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenant

`func (o *ModelsUserTenantListItem) SetTenant(v ModelsTenant)`

SetTenant sets Tenant field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


