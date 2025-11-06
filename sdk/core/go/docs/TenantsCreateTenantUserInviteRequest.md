# TenantsCreateTenantUserInviteRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Email** | **string** | Email address of the user to invite | 
**InviteUrl** | **string** | Base URL for the invite acceptance page | 
**Role** | **string** | Role to assign to the invited user | 

## Methods

### NewTenantsCreateTenantUserInviteRequest

`func NewTenantsCreateTenantUserInviteRequest(email string, inviteUrl string, role string, ) *TenantsCreateTenantUserInviteRequest`

NewTenantsCreateTenantUserInviteRequest instantiates a new TenantsCreateTenantUserInviteRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTenantsCreateTenantUserInviteRequestWithDefaults

`func NewTenantsCreateTenantUserInviteRequestWithDefaults() *TenantsCreateTenantUserInviteRequest`

NewTenantsCreateTenantUserInviteRequestWithDefaults instantiates a new TenantsCreateTenantUserInviteRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEmail

`func (o *TenantsCreateTenantUserInviteRequest) GetEmail() string`

GetEmail returns the Email field if non-nil, zero value otherwise.

### GetEmailOk

`func (o *TenantsCreateTenantUserInviteRequest) GetEmailOk() (*string, bool)`

GetEmailOk returns a tuple with the Email field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmail

`func (o *TenantsCreateTenantUserInviteRequest) SetEmail(v string)`

SetEmail sets Email field to given value.


### GetInviteUrl

`func (o *TenantsCreateTenantUserInviteRequest) GetInviteUrl() string`

GetInviteUrl returns the InviteUrl field if non-nil, zero value otherwise.

### GetInviteUrlOk

`func (o *TenantsCreateTenantUserInviteRequest) GetInviteUrlOk() (*string, bool)`

GetInviteUrlOk returns a tuple with the InviteUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInviteUrl

`func (o *TenantsCreateTenantUserInviteRequest) SetInviteUrl(v string)`

SetInviteUrl sets InviteUrl field to given value.


### GetRole

`func (o *TenantsCreateTenantUserInviteRequest) GetRole() string`

GetRole returns the Role field if non-nil, zero value otherwise.

### GetRoleOk

`func (o *TenantsCreateTenantUserInviteRequest) GetRoleOk() (*string, bool)`

GetRoleOk returns a tuple with the Role field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRole

`func (o *TenantsCreateTenantUserInviteRequest) SetRole(v string)`

SetRole sets Role field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


