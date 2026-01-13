# UserTenantListItem

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Tenant** | [**Tenant**](Tenant.md) |  | 
**IsActive** | **bool** | Whether this is the user&#39;s currently active tenant | 

## Methods

### NewUserTenantListItem

`func NewUserTenantListItem(tenant Tenant, isActive bool, ) *UserTenantListItem`

NewUserTenantListItem instantiates a new UserTenantListItem object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUserTenantListItemWithDefaults

`func NewUserTenantListItemWithDefaults() *UserTenantListItem`

NewUserTenantListItemWithDefaults instantiates a new UserTenantListItem object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetTenant

`func (o *UserTenantListItem) GetTenant() Tenant`

GetTenant returns the Tenant field if non-nil, zero value otherwise.

### GetTenantOk

`func (o *UserTenantListItem) GetTenantOk() (*Tenant, bool)`

GetTenantOk returns a tuple with the Tenant field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenant

`func (o *UserTenantListItem) SetTenant(v Tenant)`

SetTenant sets Tenant field to given value.


### GetIsActive

`func (o *UserTenantListItem) GetIsActive() bool`

GetIsActive returns the IsActive field if non-nil, zero value otherwise.

### GetIsActiveOk

`func (o *UserTenantListItem) GetIsActiveOk() (*bool, bool)`

GetIsActiveOk returns a tuple with the IsActive field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIsActive

`func (o *UserTenantListItem) SetIsActive(v bool)`

SetIsActive sets IsActive field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


