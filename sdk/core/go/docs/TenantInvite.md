# TenantInvite

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** | Unique invite identifier | 
**TenantId** | **string** | ID of the tenant being invited to | 
**Email** | **string** | Email address of invitee | 
**Role** | **string** | Role to assign upon acceptance | 
**Token** | **string** | Unique invite token | 
**InviterId** | **string** | ID of user who created the invite (references auth.identities.id) | 
**ExpiresAt** | **time.Time** | Timestamp when invite expires | 
**UsedAt** | Pointer to **time.Time** | Timestamp when invite was used (null if not used) | [optional] 
**CreatedAt** | **time.Time** | Timestamp when invite was created | 
**Tenant** | Pointer to [**Tenant**](Tenant.md) |  | [optional] 

## Methods

### NewTenantInvite

`func NewTenantInvite(id string, tenantId string, email string, role string, token string, inviterId string, expiresAt time.Time, createdAt time.Time, ) *TenantInvite`

NewTenantInvite instantiates a new TenantInvite object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTenantInviteWithDefaults

`func NewTenantInviteWithDefaults() *TenantInvite`

NewTenantInviteWithDefaults instantiates a new TenantInvite object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *TenantInvite) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *TenantInvite) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *TenantInvite) SetId(v string)`

SetId sets Id field to given value.


### GetTenantId

`func (o *TenantInvite) GetTenantId() string`

GetTenantId returns the TenantId field if non-nil, zero value otherwise.

### GetTenantIdOk

`func (o *TenantInvite) GetTenantIdOk() (*string, bool)`

GetTenantIdOk returns a tuple with the TenantId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenantId

`func (o *TenantInvite) SetTenantId(v string)`

SetTenantId sets TenantId field to given value.


### GetEmail

`func (o *TenantInvite) GetEmail() string`

GetEmail returns the Email field if non-nil, zero value otherwise.

### GetEmailOk

`func (o *TenantInvite) GetEmailOk() (*string, bool)`

GetEmailOk returns a tuple with the Email field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmail

`func (o *TenantInvite) SetEmail(v string)`

SetEmail sets Email field to given value.


### GetRole

`func (o *TenantInvite) GetRole() string`

GetRole returns the Role field if non-nil, zero value otherwise.

### GetRoleOk

`func (o *TenantInvite) GetRoleOk() (*string, bool)`

GetRoleOk returns a tuple with the Role field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRole

`func (o *TenantInvite) SetRole(v string)`

SetRole sets Role field to given value.


### GetToken

`func (o *TenantInvite) GetToken() string`

GetToken returns the Token field if non-nil, zero value otherwise.

### GetTokenOk

`func (o *TenantInvite) GetTokenOk() (*string, bool)`

GetTokenOk returns a tuple with the Token field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetToken

`func (o *TenantInvite) SetToken(v string)`

SetToken sets Token field to given value.


### GetInviterId

`func (o *TenantInvite) GetInviterId() string`

GetInviterId returns the InviterId field if non-nil, zero value otherwise.

### GetInviterIdOk

`func (o *TenantInvite) GetInviterIdOk() (*string, bool)`

GetInviterIdOk returns a tuple with the InviterId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInviterId

`func (o *TenantInvite) SetInviterId(v string)`

SetInviterId sets InviterId field to given value.


### GetExpiresAt

`func (o *TenantInvite) GetExpiresAt() time.Time`

GetExpiresAt returns the ExpiresAt field if non-nil, zero value otherwise.

### GetExpiresAtOk

`func (o *TenantInvite) GetExpiresAtOk() (*time.Time, bool)`

GetExpiresAtOk returns a tuple with the ExpiresAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetExpiresAt

`func (o *TenantInvite) SetExpiresAt(v time.Time)`

SetExpiresAt sets ExpiresAt field to given value.


### GetUsedAt

`func (o *TenantInvite) GetUsedAt() time.Time`

GetUsedAt returns the UsedAt field if non-nil, zero value otherwise.

### GetUsedAtOk

`func (o *TenantInvite) GetUsedAtOk() (*time.Time, bool)`

GetUsedAtOk returns a tuple with the UsedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUsedAt

`func (o *TenantInvite) SetUsedAt(v time.Time)`

SetUsedAt sets UsedAt field to given value.

### HasUsedAt

`func (o *TenantInvite) HasUsedAt() bool`

HasUsedAt returns a boolean if a field has been set.

### GetCreatedAt

`func (o *TenantInvite) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *TenantInvite) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *TenantInvite) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.


### GetTenant

`func (o *TenantInvite) GetTenant() Tenant`

GetTenant returns the Tenant field if non-nil, zero value otherwise.

### GetTenantOk

`func (o *TenantInvite) GetTenantOk() (*Tenant, bool)`

GetTenantOk returns a tuple with the Tenant field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenant

`func (o *TenantInvite) SetTenant(v Tenant)`

SetTenant sets Tenant field to given value.

### HasTenant

`func (o *TenantInvite) HasTenant() bool`

HasTenant returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


