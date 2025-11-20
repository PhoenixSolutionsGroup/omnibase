# ListTenantsResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Tenants** | [**[]UserTenantListItem**](UserTenantListItem.md) |  | 

## Methods

### NewListTenantsResponse

`func NewListTenantsResponse(tenants []UserTenantListItem, ) *ListTenantsResponse`

NewListTenantsResponse instantiates a new ListTenantsResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewListTenantsResponseWithDefaults

`func NewListTenantsResponseWithDefaults() *ListTenantsResponse`

NewListTenantsResponseWithDefaults instantiates a new ListTenantsResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetTenants

`func (o *ListTenantsResponse) GetTenants() []UserTenantListItem`

GetTenants returns the Tenants field if non-nil, zero value otherwise.

### GetTenantsOk

`func (o *ListTenantsResponse) GetTenantsOk() (*[]UserTenantListItem, bool)`

GetTenantsOk returns a tuple with the Tenants field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenants

`func (o *ListTenantsResponse) SetTenants(v []UserTenantListItem)`

SetTenants sets Tenants field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


