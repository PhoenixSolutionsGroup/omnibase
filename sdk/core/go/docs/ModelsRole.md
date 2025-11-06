# ModelsRole

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**CreatedAt** | **string** |  | 
**Id** | **string** |  | 
**Permissions** | **[]string** |  | 
**RoleName** | **string** |  | 
**TenantId** | Pointer to **string** | NULL for system roles | [optional] 
**UpdatedAt** | **string** |  | 
**UserIds** | **[]string** |  | 

## Methods

### NewModelsRole

`func NewModelsRole(createdAt string, id string, permissions []string, roleName string, updatedAt string, userIds []string, ) *ModelsRole`

NewModelsRole instantiates a new ModelsRole object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsRoleWithDefaults

`func NewModelsRoleWithDefaults() *ModelsRole`

NewModelsRoleWithDefaults instantiates a new ModelsRole object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCreatedAt

`func (o *ModelsRole) GetCreatedAt() string`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *ModelsRole) GetCreatedAtOk() (*string, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *ModelsRole) SetCreatedAt(v string)`

SetCreatedAt sets CreatedAt field to given value.


### GetId

`func (o *ModelsRole) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ModelsRole) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ModelsRole) SetId(v string)`

SetId sets Id field to given value.


### GetPermissions

`func (o *ModelsRole) GetPermissions() []string`

GetPermissions returns the Permissions field if non-nil, zero value otherwise.

### GetPermissionsOk

`func (o *ModelsRole) GetPermissionsOk() (*[]string, bool)`

GetPermissionsOk returns a tuple with the Permissions field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPermissions

`func (o *ModelsRole) SetPermissions(v []string)`

SetPermissions sets Permissions field to given value.


### GetRoleName

`func (o *ModelsRole) GetRoleName() string`

GetRoleName returns the RoleName field if non-nil, zero value otherwise.

### GetRoleNameOk

`func (o *ModelsRole) GetRoleNameOk() (*string, bool)`

GetRoleNameOk returns a tuple with the RoleName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRoleName

`func (o *ModelsRole) SetRoleName(v string)`

SetRoleName sets RoleName field to given value.


### GetTenantId

`func (o *ModelsRole) GetTenantId() string`

GetTenantId returns the TenantId field if non-nil, zero value otherwise.

### GetTenantIdOk

`func (o *ModelsRole) GetTenantIdOk() (*string, bool)`

GetTenantIdOk returns a tuple with the TenantId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenantId

`func (o *ModelsRole) SetTenantId(v string)`

SetTenantId sets TenantId field to given value.

### HasTenantId

`func (o *ModelsRole) HasTenantId() bool`

HasTenantId returns a boolean if a field has been set.

### GetUpdatedAt

`func (o *ModelsRole) GetUpdatedAt() string`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *ModelsRole) GetUpdatedAtOk() (*string, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *ModelsRole) SetUpdatedAt(v string)`

SetUpdatedAt sets UpdatedAt field to given value.


### GetUserIds

`func (o *ModelsRole) GetUserIds() []string`

GetUserIds returns the UserIds field if non-nil, zero value otherwise.

### GetUserIdsOk

`func (o *ModelsRole) GetUserIdsOk() (*[]string, bool)`

GetUserIdsOk returns a tuple with the UserIds field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUserIds

`func (o *ModelsRole) SetUserIds(v []string)`

SetUserIds sets UserIds field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


