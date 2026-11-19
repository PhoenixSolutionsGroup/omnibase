# ListRolesByTenantRow

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**CreatedAt** | **time.Time** |  | 
**Id** | **string** |  | 
**Permissions** | **[]string** |  | 
**RoleName** | **string** |  | 
**TemplateId** | **string** |  | 
**TenantId** | **string** |  | 
**UpdatedAt** | **time.Time** |  | 
**UserIds** | **[]string** |  | 

## Methods

### NewListRolesByTenantRow

`func NewListRolesByTenantRow(createdAt time.Time, id string, permissions []string, roleName string, templateId string, tenantId string, updatedAt time.Time, userIds []string, ) *ListRolesByTenantRow`

NewListRolesByTenantRow instantiates a new ListRolesByTenantRow object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewListRolesByTenantRowWithDefaults

`func NewListRolesByTenantRowWithDefaults() *ListRolesByTenantRow`

NewListRolesByTenantRowWithDefaults instantiates a new ListRolesByTenantRow object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCreatedAt

`func (o *ListRolesByTenantRow) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *ListRolesByTenantRow) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *ListRolesByTenantRow) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.


### GetId

`func (o *ListRolesByTenantRow) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ListRolesByTenantRow) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ListRolesByTenantRow) SetId(v string)`

SetId sets Id field to given value.


### GetPermissions

`func (o *ListRolesByTenantRow) GetPermissions() []string`

GetPermissions returns the Permissions field if non-nil, zero value otherwise.

### GetPermissionsOk

`func (o *ListRolesByTenantRow) GetPermissionsOk() (*[]string, bool)`

GetPermissionsOk returns a tuple with the Permissions field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPermissions

`func (o *ListRolesByTenantRow) SetPermissions(v []string)`

SetPermissions sets Permissions field to given value.


### SetPermissionsNil

`func (o *ListRolesByTenantRow) SetPermissionsNil(b bool)`

 SetPermissionsNil sets the value for Permissions to be an explicit nil

### UnsetPermissions
`func (o *ListRolesByTenantRow) UnsetPermissions()`

UnsetPermissions ensures that no value is present for Permissions, not even an explicit nil
### GetRoleName

`func (o *ListRolesByTenantRow) GetRoleName() string`

GetRoleName returns the RoleName field if non-nil, zero value otherwise.

### GetRoleNameOk

`func (o *ListRolesByTenantRow) GetRoleNameOk() (*string, bool)`

GetRoleNameOk returns a tuple with the RoleName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRoleName

`func (o *ListRolesByTenantRow) SetRoleName(v string)`

SetRoleName sets RoleName field to given value.


### GetTemplateId

`func (o *ListRolesByTenantRow) GetTemplateId() string`

GetTemplateId returns the TemplateId field if non-nil, zero value otherwise.

### GetTemplateIdOk

`func (o *ListRolesByTenantRow) GetTemplateIdOk() (*string, bool)`

GetTemplateIdOk returns a tuple with the TemplateId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTemplateId

`func (o *ListRolesByTenantRow) SetTemplateId(v string)`

SetTemplateId sets TemplateId field to given value.


### GetTenantId

`func (o *ListRolesByTenantRow) GetTenantId() string`

GetTenantId returns the TenantId field if non-nil, zero value otherwise.

### GetTenantIdOk

`func (o *ListRolesByTenantRow) GetTenantIdOk() (*string, bool)`

GetTenantIdOk returns a tuple with the TenantId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenantId

`func (o *ListRolesByTenantRow) SetTenantId(v string)`

SetTenantId sets TenantId field to given value.


### GetUpdatedAt

`func (o *ListRolesByTenantRow) GetUpdatedAt() time.Time`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *ListRolesByTenantRow) GetUpdatedAtOk() (*time.Time, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *ListRolesByTenantRow) SetUpdatedAt(v time.Time)`

SetUpdatedAt sets UpdatedAt field to given value.


### GetUserIds

`func (o *ListRolesByTenantRow) GetUserIds() []string`

GetUserIds returns the UserIds field if non-nil, zero value otherwise.

### GetUserIdsOk

`func (o *ListRolesByTenantRow) GetUserIdsOk() (*[]string, bool)`

GetUserIdsOk returns a tuple with the UserIds field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUserIds

`func (o *ListRolesByTenantRow) SetUserIds(v []string)`

SetUserIds sets UserIds field to given value.


### SetUserIdsNil

`func (o *ListRolesByTenantRow) SetUserIdsNil(b bool)`

 SetUserIdsNil sets the value for UserIds to be an explicit nil

### UnsetUserIds
`func (o *ListRolesByTenantRow) UnsetUserIds()`

UnsetUserIds ensures that no value is present for UserIds, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


