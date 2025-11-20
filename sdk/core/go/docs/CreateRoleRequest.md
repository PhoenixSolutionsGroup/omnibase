# CreateRoleRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**RoleName** | **string** | Name of the role (required, cannot be empty) | 
**Permissions** | **[]string** | List of permissions in namespace:resource#relation format (required, must have at least one non-empty permission). Empty strings are not allowed and will be rejected with a 400 error. | 

## Methods

### NewCreateRoleRequest

`func NewCreateRoleRequest(roleName string, permissions []string, ) *CreateRoleRequest`

NewCreateRoleRequest instantiates a new CreateRoleRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateRoleRequestWithDefaults

`func NewCreateRoleRequestWithDefaults() *CreateRoleRequest`

NewCreateRoleRequestWithDefaults instantiates a new CreateRoleRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetRoleName

`func (o *CreateRoleRequest) GetRoleName() string`

GetRoleName returns the RoleName field if non-nil, zero value otherwise.

### GetRoleNameOk

`func (o *CreateRoleRequest) GetRoleNameOk() (*string, bool)`

GetRoleNameOk returns a tuple with the RoleName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRoleName

`func (o *CreateRoleRequest) SetRoleName(v string)`

SetRoleName sets RoleName field to given value.


### GetPermissions

`func (o *CreateRoleRequest) GetPermissions() []string`

GetPermissions returns the Permissions field if non-nil, zero value otherwise.

### GetPermissionsOk

`func (o *CreateRoleRequest) GetPermissionsOk() (*[]string, bool)`

GetPermissionsOk returns a tuple with the Permissions field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPermissions

`func (o *CreateRoleRequest) SetPermissions(v []string)`

SetPermissions sets Permissions field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


