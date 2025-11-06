# TenantsUpdateTenantUserRoleRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Role** | **string** | New role to assign | 
**UserId** | **string** | Target user ID | 

## Methods

### NewTenantsUpdateTenantUserRoleRequest

`func NewTenantsUpdateTenantUserRoleRequest(role string, userId string, ) *TenantsUpdateTenantUserRoleRequest`

NewTenantsUpdateTenantUserRoleRequest instantiates a new TenantsUpdateTenantUserRoleRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTenantsUpdateTenantUserRoleRequestWithDefaults

`func NewTenantsUpdateTenantUserRoleRequestWithDefaults() *TenantsUpdateTenantUserRoleRequest`

NewTenantsUpdateTenantUserRoleRequestWithDefaults instantiates a new TenantsUpdateTenantUserRoleRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetRole

`func (o *TenantsUpdateTenantUserRoleRequest) GetRole() string`

GetRole returns the Role field if non-nil, zero value otherwise.

### GetRoleOk

`func (o *TenantsUpdateTenantUserRoleRequest) GetRoleOk() (*string, bool)`

GetRoleOk returns a tuple with the Role field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRole

`func (o *TenantsUpdateTenantUserRoleRequest) SetRole(v string)`

SetRole sets Role field to given value.


### GetUserId

`func (o *TenantsUpdateTenantUserRoleRequest) GetUserId() string`

GetUserId returns the UserId field if non-nil, zero value otherwise.

### GetUserIdOk

`func (o *TenantsUpdateTenantUserRoleRequest) GetUserIdOk() (*string, bool)`

GetUserIdOk returns a tuple with the UserId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUserId

`func (o *TenantsUpdateTenantUserRoleRequest) SetUserId(v string)`

SetUserId sets UserId field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


