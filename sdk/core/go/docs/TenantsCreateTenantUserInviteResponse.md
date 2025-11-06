# TenantsCreateTenantUserInviteResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Invite** | [**ModelsTenantInvite**](ModelsTenantInvite.md) | Created invite | 
**Message** | **string** | Success message | 

## Methods

### NewTenantsCreateTenantUserInviteResponse

`func NewTenantsCreateTenantUserInviteResponse(invite ModelsTenantInvite, message string, ) *TenantsCreateTenantUserInviteResponse`

NewTenantsCreateTenantUserInviteResponse instantiates a new TenantsCreateTenantUserInviteResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTenantsCreateTenantUserInviteResponseWithDefaults

`func NewTenantsCreateTenantUserInviteResponseWithDefaults() *TenantsCreateTenantUserInviteResponse`

NewTenantsCreateTenantUserInviteResponseWithDefaults instantiates a new TenantsCreateTenantUserInviteResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetInvite

`func (o *TenantsCreateTenantUserInviteResponse) GetInvite() ModelsTenantInvite`

GetInvite returns the Invite field if non-nil, zero value otherwise.

### GetInviteOk

`func (o *TenantsCreateTenantUserInviteResponse) GetInviteOk() (*ModelsTenantInvite, bool)`

GetInviteOk returns a tuple with the Invite field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInvite

`func (o *TenantsCreateTenantUserInviteResponse) SetInvite(v ModelsTenantInvite)`

SetInvite sets Invite field to given value.


### GetMessage

`func (o *TenantsCreateTenantUserInviteResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *TenantsCreateTenantUserInviteResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *TenantsCreateTenantUserInviteResponse) SetMessage(v string)`

SetMessage sets Message field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


