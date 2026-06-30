# UserTenantListItem

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**IsActive** | **bool** |  | 
**Tenant** | [**GetTenantByIDRow**](GetTenantByIDRow.md) |  | 

## Methods

### NewUserTenantListItem

`func NewUserTenantListItem(isActive bool, tenant GetTenantByIDRow, ) *UserTenantListItem`

NewUserTenantListItem instantiates a new UserTenantListItem object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUserTenantListItemWithDefaults

`func NewUserTenantListItemWithDefaults() *UserTenantListItem`

NewUserTenantListItemWithDefaults instantiates a new UserTenantListItem object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

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


### GetTenant

`func (o *UserTenantListItem) GetTenant() GetTenantByIDRow`

GetTenant returns the Tenant field if non-nil, zero value otherwise.

### GetTenantOk

`func (o *UserTenantListItem) GetTenantOk() (*GetTenantByIDRow, bool)`

GetTenantOk returns a tuple with the Tenant field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenant

`func (o *UserTenantListItem) SetTenant(v GetTenantByIDRow)`

SetTenant sets Tenant field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


