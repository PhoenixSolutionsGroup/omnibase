# TenantSettings

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**TenantId** | **string** | Tenant ID these settings belong to | 
**AllowUserInvites** | **bool** | Whether non-admin users can invite others | 
**MaxMembers** | **int32** | Maximum number of users allowed | 

## Methods

### NewTenantSettings

`func NewTenantSettings(tenantId string, allowUserInvites bool, maxMembers int32, ) *TenantSettings`

NewTenantSettings instantiates a new TenantSettings object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTenantSettingsWithDefaults

`func NewTenantSettingsWithDefaults() *TenantSettings`

NewTenantSettingsWithDefaults instantiates a new TenantSettings object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetTenantId

`func (o *TenantSettings) GetTenantId() string`

GetTenantId returns the TenantId field if non-nil, zero value otherwise.

### GetTenantIdOk

`func (o *TenantSettings) GetTenantIdOk() (*string, bool)`

GetTenantIdOk returns a tuple with the TenantId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenantId

`func (o *TenantSettings) SetTenantId(v string)`

SetTenantId sets TenantId field to given value.


### GetAllowUserInvites

`func (o *TenantSettings) GetAllowUserInvites() bool`

GetAllowUserInvites returns the AllowUserInvites field if non-nil, zero value otherwise.

### GetAllowUserInvitesOk

`func (o *TenantSettings) GetAllowUserInvitesOk() (*bool, bool)`

GetAllowUserInvitesOk returns a tuple with the AllowUserInvites field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAllowUserInvites

`func (o *TenantSettings) SetAllowUserInvites(v bool)`

SetAllowUserInvites sets AllowUserInvites field to given value.


### GetMaxMembers

`func (o *TenantSettings) GetMaxMembers() int32`

GetMaxMembers returns the MaxMembers field if non-nil, zero value otherwise.

### GetMaxMembersOk

`func (o *TenantSettings) GetMaxMembersOk() (*int32, bool)`

GetMaxMembersOk returns a tuple with the MaxMembers field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMaxMembers

`func (o *TenantSettings) SetMaxMembers(v int32)`

SetMaxMembers sets MaxMembers field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


