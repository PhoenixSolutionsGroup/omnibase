# ModelsListTenantsResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Tenants** | [**[]ModelsUserTenantListItem**](ModelsUserTenantListItem.md) |  | 

## Methods

### NewModelsListTenantsResponse

`func NewModelsListTenantsResponse(tenants []ModelsUserTenantListItem, ) *ModelsListTenantsResponse`

NewModelsListTenantsResponse instantiates a new ModelsListTenantsResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsListTenantsResponseWithDefaults

`func NewModelsListTenantsResponseWithDefaults() *ModelsListTenantsResponse`

NewModelsListTenantsResponseWithDefaults instantiates a new ModelsListTenantsResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetTenants

`func (o *ModelsListTenantsResponse) GetTenants() []ModelsUserTenantListItem`

GetTenants returns the Tenants field if non-nil, zero value otherwise.

### GetTenantsOk

`func (o *ModelsListTenantsResponse) GetTenantsOk() (*[]ModelsUserTenantListItem, bool)`

GetTenantsOk returns a tuple with the Tenants field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenants

`func (o *ModelsListTenantsResponse) SetTenants(v []ModelsUserTenantListItem)`

SetTenants sets Tenants field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


