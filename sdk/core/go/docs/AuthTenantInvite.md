# AuthTenantInvite

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**CreatedAt** | **time.Time** |  | 
**Email** | **string** |  | 
**ExpiresAt** | **time.Time** |  | 
**Id** | **string** |  | 
**InviterId** | **string** |  | 
**Role** | **string** |  | 
**TenantId** | **string** |  | 
**Token** | **string** |  | 
**UsedAt** | **NullableTime** |  | 

## Methods

### NewAuthTenantInvite

`func NewAuthTenantInvite(createdAt time.Time, email string, expiresAt time.Time, id string, inviterId string, role string, tenantId string, token string, usedAt NullableTime, ) *AuthTenantInvite`

NewAuthTenantInvite instantiates a new AuthTenantInvite object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAuthTenantInviteWithDefaults

`func NewAuthTenantInviteWithDefaults() *AuthTenantInvite`

NewAuthTenantInviteWithDefaults instantiates a new AuthTenantInvite object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCreatedAt

`func (o *AuthTenantInvite) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *AuthTenantInvite) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *AuthTenantInvite) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.


### GetEmail

`func (o *AuthTenantInvite) GetEmail() string`

GetEmail returns the Email field if non-nil, zero value otherwise.

### GetEmailOk

`func (o *AuthTenantInvite) GetEmailOk() (*string, bool)`

GetEmailOk returns a tuple with the Email field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmail

`func (o *AuthTenantInvite) SetEmail(v string)`

SetEmail sets Email field to given value.


### GetExpiresAt

`func (o *AuthTenantInvite) GetExpiresAt() time.Time`

GetExpiresAt returns the ExpiresAt field if non-nil, zero value otherwise.

### GetExpiresAtOk

`func (o *AuthTenantInvite) GetExpiresAtOk() (*time.Time, bool)`

GetExpiresAtOk returns a tuple with the ExpiresAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetExpiresAt

`func (o *AuthTenantInvite) SetExpiresAt(v time.Time)`

SetExpiresAt sets ExpiresAt field to given value.


### GetId

`func (o *AuthTenantInvite) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *AuthTenantInvite) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *AuthTenantInvite) SetId(v string)`

SetId sets Id field to given value.


### GetInviterId

`func (o *AuthTenantInvite) GetInviterId() string`

GetInviterId returns the InviterId field if non-nil, zero value otherwise.

### GetInviterIdOk

`func (o *AuthTenantInvite) GetInviterIdOk() (*string, bool)`

GetInviterIdOk returns a tuple with the InviterId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInviterId

`func (o *AuthTenantInvite) SetInviterId(v string)`

SetInviterId sets InviterId field to given value.


### GetRole

`func (o *AuthTenantInvite) GetRole() string`

GetRole returns the Role field if non-nil, zero value otherwise.

### GetRoleOk

`func (o *AuthTenantInvite) GetRoleOk() (*string, bool)`

GetRoleOk returns a tuple with the Role field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRole

`func (o *AuthTenantInvite) SetRole(v string)`

SetRole sets Role field to given value.


### GetTenantId

`func (o *AuthTenantInvite) GetTenantId() string`

GetTenantId returns the TenantId field if non-nil, zero value otherwise.

### GetTenantIdOk

`func (o *AuthTenantInvite) GetTenantIdOk() (*string, bool)`

GetTenantIdOk returns a tuple with the TenantId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenantId

`func (o *AuthTenantInvite) SetTenantId(v string)`

SetTenantId sets TenantId field to given value.


### GetToken

`func (o *AuthTenantInvite) GetToken() string`

GetToken returns the Token field if non-nil, zero value otherwise.

### GetTokenOk

`func (o *AuthTenantInvite) GetTokenOk() (*string, bool)`

GetTokenOk returns a tuple with the Token field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetToken

`func (o *AuthTenantInvite) SetToken(v string)`

SetToken sets Token field to given value.


### GetUsedAt

`func (o *AuthTenantInvite) GetUsedAt() time.Time`

GetUsedAt returns the UsedAt field if non-nil, zero value otherwise.

### GetUsedAtOk

`func (o *AuthTenantInvite) GetUsedAtOk() (*time.Time, bool)`

GetUsedAtOk returns a tuple with the UsedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUsedAt

`func (o *AuthTenantInvite) SetUsedAt(v time.Time)`

SetUsedAt sets UsedAt field to given value.


### SetUsedAtNil

`func (o *AuthTenantInvite) SetUsedAtNil(b bool)`

 SetUsedAtNil sets the value for UsedAt to be an explicit nil

### UnsetUsedAt
`func (o *AuthTenantInvite) UnsetUsedAt()`

UnsetUsedAt ensures that no value is present for UsedAt, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


