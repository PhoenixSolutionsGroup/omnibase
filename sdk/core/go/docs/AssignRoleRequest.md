# AssignRoleRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**RoleId** | **string** | Role ID to assign (provide either role_id or role_name, not both) | 
**RoleName** | **string** | Role name to assign (provide either role_id or role_name, not both) | 

## Methods

### NewAssignRoleRequest

`func NewAssignRoleRequest(roleId string, roleName string, ) *AssignRoleRequest`

NewAssignRoleRequest instantiates a new AssignRoleRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAssignRoleRequestWithDefaults

`func NewAssignRoleRequestWithDefaults() *AssignRoleRequest`

NewAssignRoleRequestWithDefaults instantiates a new AssignRoleRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetRoleId

`func (o *AssignRoleRequest) GetRoleId() string`

GetRoleId returns the RoleId field if non-nil, zero value otherwise.

### GetRoleIdOk

`func (o *AssignRoleRequest) GetRoleIdOk() (*string, bool)`

GetRoleIdOk returns a tuple with the RoleId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRoleId

`func (o *AssignRoleRequest) SetRoleId(v string)`

SetRoleId sets RoleId field to given value.


### GetRoleName

`func (o *AssignRoleRequest) GetRoleName() string`

GetRoleName returns the RoleName field if non-nil, zero value otherwise.

### GetRoleNameOk

`func (o *AssignRoleRequest) GetRoleNameOk() (*string, bool)`

GetRoleNameOk returns a tuple with the RoleName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRoleName

`func (o *AssignRoleRequest) SetRoleName(v string)`

SetRoleName sets RoleName field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


