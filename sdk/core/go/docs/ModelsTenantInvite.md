# ModelsTenantInvite

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**CreatedAt** | **string** |  | 
**Email** | **string** |  | 
**ExpiresAt** | **string** |  | 
**Id** | **string** |  | 
**InviterId** | **string** | References auth.identities.id | 
**Role** | **string** |  | 
**Tenant** | Pointer to [**ModelsTenant**](ModelsTenant.md) | Optional joined fields | [optional] 
**TenantId** | **string** |  | 
**Token** | **string** |  | 
**UsedAt** | Pointer to **string** |  | [optional] 

## Methods

### NewModelsTenantInvite

`func NewModelsTenantInvite(createdAt string, email string, expiresAt string, id string, inviterId string, role string, tenantId string, token string, ) *ModelsTenantInvite`

NewModelsTenantInvite instantiates a new ModelsTenantInvite object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsTenantInviteWithDefaults

`func NewModelsTenantInviteWithDefaults() *ModelsTenantInvite`

NewModelsTenantInviteWithDefaults instantiates a new ModelsTenantInvite object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCreatedAt

`func (o *ModelsTenantInvite) GetCreatedAt() string`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *ModelsTenantInvite) GetCreatedAtOk() (*string, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *ModelsTenantInvite) SetCreatedAt(v string)`

SetCreatedAt sets CreatedAt field to given value.


### GetEmail

`func (o *ModelsTenantInvite) GetEmail() string`

GetEmail returns the Email field if non-nil, zero value otherwise.

### GetEmailOk

`func (o *ModelsTenantInvite) GetEmailOk() (*string, bool)`

GetEmailOk returns a tuple with the Email field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmail

`func (o *ModelsTenantInvite) SetEmail(v string)`

SetEmail sets Email field to given value.


### GetExpiresAt

`func (o *ModelsTenantInvite) GetExpiresAt() string`

GetExpiresAt returns the ExpiresAt field if non-nil, zero value otherwise.

### GetExpiresAtOk

`func (o *ModelsTenantInvite) GetExpiresAtOk() (*string, bool)`

GetExpiresAtOk returns a tuple with the ExpiresAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetExpiresAt

`func (o *ModelsTenantInvite) SetExpiresAt(v string)`

SetExpiresAt sets ExpiresAt field to given value.


### GetId

`func (o *ModelsTenantInvite) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ModelsTenantInvite) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ModelsTenantInvite) SetId(v string)`

SetId sets Id field to given value.


### GetInviterId

`func (o *ModelsTenantInvite) GetInviterId() string`

GetInviterId returns the InviterId field if non-nil, zero value otherwise.

### GetInviterIdOk

`func (o *ModelsTenantInvite) GetInviterIdOk() (*string, bool)`

GetInviterIdOk returns a tuple with the InviterId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInviterId

`func (o *ModelsTenantInvite) SetInviterId(v string)`

SetInviterId sets InviterId field to given value.


### GetRole

`func (o *ModelsTenantInvite) GetRole() string`

GetRole returns the Role field if non-nil, zero value otherwise.

### GetRoleOk

`func (o *ModelsTenantInvite) GetRoleOk() (*string, bool)`

GetRoleOk returns a tuple with the Role field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRole

`func (o *ModelsTenantInvite) SetRole(v string)`

SetRole sets Role field to given value.


### GetTenant

`func (o *ModelsTenantInvite) GetTenant() ModelsTenant`

GetTenant returns the Tenant field if non-nil, zero value otherwise.

### GetTenantOk

`func (o *ModelsTenantInvite) GetTenantOk() (*ModelsTenant, bool)`

GetTenantOk returns a tuple with the Tenant field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenant

`func (o *ModelsTenantInvite) SetTenant(v ModelsTenant)`

SetTenant sets Tenant field to given value.

### HasTenant

`func (o *ModelsTenantInvite) HasTenant() bool`

HasTenant returns a boolean if a field has been set.

### GetTenantId

`func (o *ModelsTenantInvite) GetTenantId() string`

GetTenantId returns the TenantId field if non-nil, zero value otherwise.

### GetTenantIdOk

`func (o *ModelsTenantInvite) GetTenantIdOk() (*string, bool)`

GetTenantIdOk returns a tuple with the TenantId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenantId

`func (o *ModelsTenantInvite) SetTenantId(v string)`

SetTenantId sets TenantId field to given value.


### GetToken

`func (o *ModelsTenantInvite) GetToken() string`

GetToken returns the Token field if non-nil, zero value otherwise.

### GetTokenOk

`func (o *ModelsTenantInvite) GetTokenOk() (*string, bool)`

GetTokenOk returns a tuple with the Token field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetToken

`func (o *ModelsTenantInvite) SetToken(v string)`

SetToken sets Token field to given value.


### GetUsedAt

`func (o *ModelsTenantInvite) GetUsedAt() string`

GetUsedAt returns the UsedAt field if non-nil, zero value otherwise.

### GetUsedAtOk

`func (o *ModelsTenantInvite) GetUsedAtOk() (*string, bool)`

GetUsedAtOk returns a tuple with the UsedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUsedAt

`func (o *ModelsTenantInvite) SetUsedAt(v string)`

SetUsedAt sets UsedAt field to given value.

### HasUsedAt

`func (o *ModelsTenantInvite) HasUsedAt() bool`

HasUsedAt returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


