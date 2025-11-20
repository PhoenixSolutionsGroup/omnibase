# CreateTenantUserInviteResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Invite** | [**TenantInvite**](TenantInvite.md) |  | 
**Message** | **string** | Success message | 

## Methods

### NewCreateTenantUserInviteResponse

`func NewCreateTenantUserInviteResponse(invite TenantInvite, message string, ) *CreateTenantUserInviteResponse`

NewCreateTenantUserInviteResponse instantiates a new CreateTenantUserInviteResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateTenantUserInviteResponseWithDefaults

`func NewCreateTenantUserInviteResponseWithDefaults() *CreateTenantUserInviteResponse`

NewCreateTenantUserInviteResponseWithDefaults instantiates a new CreateTenantUserInviteResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetInvite

`func (o *CreateTenantUserInviteResponse) GetInvite() TenantInvite`

GetInvite returns the Invite field if non-nil, zero value otherwise.

### GetInviteOk

`func (o *CreateTenantUserInviteResponse) GetInviteOk() (*TenantInvite, bool)`

GetInviteOk returns a tuple with the Invite field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInvite

`func (o *CreateTenantUserInviteResponse) SetInvite(v TenantInvite)`

SetInvite sets Invite field to given value.


### GetMessage

`func (o *CreateTenantUserInviteResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *CreateTenantUserInviteResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *CreateTenantUserInviteResponse) SetMessage(v string)`

SetMessage sets Message field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


