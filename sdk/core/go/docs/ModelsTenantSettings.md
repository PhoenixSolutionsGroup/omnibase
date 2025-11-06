# ModelsTenantSettings

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**AllowUserInvites** | **bool** |  | 
**MaxMembers** | **int32** |  | 
**TenantId** | **string** |  | 

## Methods

### NewModelsTenantSettings

`func NewModelsTenantSettings(allowUserInvites bool, maxMembers int32, tenantId string, ) *ModelsTenantSettings`

NewModelsTenantSettings instantiates a new ModelsTenantSettings object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsTenantSettingsWithDefaults

`func NewModelsTenantSettingsWithDefaults() *ModelsTenantSettings`

NewModelsTenantSettingsWithDefaults instantiates a new ModelsTenantSettings object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAllowUserInvites

`func (o *ModelsTenantSettings) GetAllowUserInvites() bool`

GetAllowUserInvites returns the AllowUserInvites field if non-nil, zero value otherwise.

### GetAllowUserInvitesOk

`func (o *ModelsTenantSettings) GetAllowUserInvitesOk() (*bool, bool)`

GetAllowUserInvitesOk returns a tuple with the AllowUserInvites field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAllowUserInvites

`func (o *ModelsTenantSettings) SetAllowUserInvites(v bool)`

SetAllowUserInvites sets AllowUserInvites field to given value.


### GetMaxMembers

`func (o *ModelsTenantSettings) GetMaxMembers() int32`

GetMaxMembers returns the MaxMembers field if non-nil, zero value otherwise.

### GetMaxMembersOk

`func (o *ModelsTenantSettings) GetMaxMembersOk() (*int32, bool)`

GetMaxMembersOk returns a tuple with the MaxMembers field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMaxMembers

`func (o *ModelsTenantSettings) SetMaxMembers(v int32)`

SetMaxMembers sets MaxMembers field to given value.


### GetTenantId

`func (o *ModelsTenantSettings) GetTenantId() string`

GetTenantId returns the TenantId field if non-nil, zero value otherwise.

### GetTenantIdOk

`func (o *ModelsTenantSettings) GetTenantIdOk() (*string, bool)`

GetTenantIdOk returns a tuple with the TenantId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenantId

`func (o *ModelsTenantSettings) SetTenantId(v string)`

SetTenantId sets TenantId field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


