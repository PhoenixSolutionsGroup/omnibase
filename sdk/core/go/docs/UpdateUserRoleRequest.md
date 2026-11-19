# UpdateUserRoleRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Role** | **string** |  | 
**UserId** | **string** |  | 

## Methods

### NewUpdateUserRoleRequest

`func NewUpdateUserRoleRequest(role string, userId string, ) *UpdateUserRoleRequest`

NewUpdateUserRoleRequest instantiates a new UpdateUserRoleRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUpdateUserRoleRequestWithDefaults

`func NewUpdateUserRoleRequestWithDefaults() *UpdateUserRoleRequest`

NewUpdateUserRoleRequestWithDefaults instantiates a new UpdateUserRoleRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetRole

`func (o *UpdateUserRoleRequest) GetRole() string`

GetRole returns the Role field if non-nil, zero value otherwise.

### GetRoleOk

`func (o *UpdateUserRoleRequest) GetRoleOk() (*string, bool)`

GetRoleOk returns a tuple with the Role field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRole

`func (o *UpdateUserRoleRequest) SetRole(v string)`

SetRole sets Role field to given value.


### GetUserId

`func (o *UpdateUserRoleRequest) GetUserId() string`

GetUserId returns the UserId field if non-nil, zero value otherwise.

### GetUserIdOk

`func (o *UpdateUserRoleRequest) GetUserIdOk() (*string, bool)`

GetUserIdOk returns a tuple with the UserId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUserId

`func (o *UpdateUserRoleRequest) SetUserId(v string)`

SetUserId sets UserId field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


