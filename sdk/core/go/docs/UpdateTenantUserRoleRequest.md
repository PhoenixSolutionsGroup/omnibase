# UpdateTenantUserRoleRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Role** | **string** | New role to assign | 
**UserId** | **string** | Target user ID | 

## Methods

### NewUpdateTenantUserRoleRequest

`func NewUpdateTenantUserRoleRequest(role string, userId string, ) *UpdateTenantUserRoleRequest`

NewUpdateTenantUserRoleRequest instantiates a new UpdateTenantUserRoleRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUpdateTenantUserRoleRequestWithDefaults

`func NewUpdateTenantUserRoleRequestWithDefaults() *UpdateTenantUserRoleRequest`

NewUpdateTenantUserRoleRequestWithDefaults instantiates a new UpdateTenantUserRoleRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetRole

`func (o *UpdateTenantUserRoleRequest) GetRole() string`

GetRole returns the Role field if non-nil, zero value otherwise.

### GetRoleOk

`func (o *UpdateTenantUserRoleRequest) GetRoleOk() (*string, bool)`

GetRoleOk returns a tuple with the Role field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRole

`func (o *UpdateTenantUserRoleRequest) SetRole(v string)`

SetRole sets Role field to given value.


### GetUserId

`func (o *UpdateTenantUserRoleRequest) GetUserId() string`

GetUserId returns the UserId field if non-nil, zero value otherwise.

### GetUserIdOk

`func (o *UpdateTenantUserRoleRequest) GetUserIdOk() (*string, bool)`

GetUserIdOk returns a tuple with the UserId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUserId

`func (o *UpdateTenantUserRoleRequest) SetUserId(v string)`

SetUserId sets UserId field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


