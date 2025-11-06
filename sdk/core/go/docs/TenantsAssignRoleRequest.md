# TenantsAssignRoleRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**RoleId** | Pointer to **string** | Role ID to assign (provide either role_id or role_name, not both) | [optional] 
**RoleName** | Pointer to **string** | Role name to assign (provide either role_id or role_name, not both) | [optional] 

## Methods

### NewTenantsAssignRoleRequest

`func NewTenantsAssignRoleRequest() *TenantsAssignRoleRequest`

NewTenantsAssignRoleRequest instantiates a new TenantsAssignRoleRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTenantsAssignRoleRequestWithDefaults

`func NewTenantsAssignRoleRequestWithDefaults() *TenantsAssignRoleRequest`

NewTenantsAssignRoleRequestWithDefaults instantiates a new TenantsAssignRoleRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetRoleId

`func (o *TenantsAssignRoleRequest) GetRoleId() string`

GetRoleId returns the RoleId field if non-nil, zero value otherwise.

### GetRoleIdOk

`func (o *TenantsAssignRoleRequest) GetRoleIdOk() (*string, bool)`

GetRoleIdOk returns a tuple with the RoleId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRoleId

`func (o *TenantsAssignRoleRequest) SetRoleId(v string)`

SetRoleId sets RoleId field to given value.

### HasRoleId

`func (o *TenantsAssignRoleRequest) HasRoleId() bool`

HasRoleId returns a boolean if a field has been set.

### GetRoleName

`func (o *TenantsAssignRoleRequest) GetRoleName() string`

GetRoleName returns the RoleName field if non-nil, zero value otherwise.

### GetRoleNameOk

`func (o *TenantsAssignRoleRequest) GetRoleNameOk() (*string, bool)`

GetRoleNameOk returns a tuple with the RoleName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRoleName

`func (o *TenantsAssignRoleRequest) SetRoleName(v string)`

SetRoleName sets RoleName field to given value.

### HasRoleName

`func (o *TenantsAssignRoleRequest) HasRoleName() bool`

HasRoleName returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


