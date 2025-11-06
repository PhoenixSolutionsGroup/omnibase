# TenantsCreateRoleRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Permissions** | **[]string** | List of permissions in namespace:resource#relation format | 
**RoleName** | **string** | Name of the role | 

## Methods

### NewTenantsCreateRoleRequest

`func NewTenantsCreateRoleRequest(permissions []string, roleName string, ) *TenantsCreateRoleRequest`

NewTenantsCreateRoleRequest instantiates a new TenantsCreateRoleRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTenantsCreateRoleRequestWithDefaults

`func NewTenantsCreateRoleRequestWithDefaults() *TenantsCreateRoleRequest`

NewTenantsCreateRoleRequestWithDefaults instantiates a new TenantsCreateRoleRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPermissions

`func (o *TenantsCreateRoleRequest) GetPermissions() []string`

GetPermissions returns the Permissions field if non-nil, zero value otherwise.

### GetPermissionsOk

`func (o *TenantsCreateRoleRequest) GetPermissionsOk() (*[]string, bool)`

GetPermissionsOk returns a tuple with the Permissions field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPermissions

`func (o *TenantsCreateRoleRequest) SetPermissions(v []string)`

SetPermissions sets Permissions field to given value.


### GetRoleName

`func (o *TenantsCreateRoleRequest) GetRoleName() string`

GetRoleName returns the RoleName field if non-nil, zero value otherwise.

### GetRoleNameOk

`func (o *TenantsCreateRoleRequest) GetRoleNameOk() (*string, bool)`

GetRoleNameOk returns a tuple with the RoleName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRoleName

`func (o *TenantsCreateRoleRequest) SetRoleName(v string)`

SetRoleName sets RoleName field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


