# CreateRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Email** | **string** |  | 
**InviteUrl** | **string** |  | 
**Role** | **string** |  | 

## Methods

### NewCreateRequest

`func NewCreateRequest(email string, inviteUrl string, role string, ) *CreateRequest`

NewCreateRequest instantiates a new CreateRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateRequestWithDefaults

`func NewCreateRequestWithDefaults() *CreateRequest`

NewCreateRequestWithDefaults instantiates a new CreateRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEmail

`func (o *CreateRequest) GetEmail() string`

GetEmail returns the Email field if non-nil, zero value otherwise.

### GetEmailOk

`func (o *CreateRequest) GetEmailOk() (*string, bool)`

GetEmailOk returns a tuple with the Email field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmail

`func (o *CreateRequest) SetEmail(v string)`

SetEmail sets Email field to given value.


### GetInviteUrl

`func (o *CreateRequest) GetInviteUrl() string`

GetInviteUrl returns the InviteUrl field if non-nil, zero value otherwise.

### GetInviteUrlOk

`func (o *CreateRequest) GetInviteUrlOk() (*string, bool)`

GetInviteUrlOk returns a tuple with the InviteUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInviteUrl

`func (o *CreateRequest) SetInviteUrl(v string)`

SetInviteUrl sets InviteUrl field to given value.


### GetRole

`func (o *CreateRequest) GetRole() string`

GetRole returns the Role field if non-nil, zero value otherwise.

### GetRoleOk

`func (o *CreateRequest) GetRoleOk() (*string, bool)`

GetRoleOk returns a tuple with the Role field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRole

`func (o *CreateRequest) SetRole(v string)`

SetRole sets Role field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


