# CreateResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Invite** | [**AuthTenantInvite**](AuthTenantInvite.md) |  | 
**Message** | **string** |  | 

## Methods

### NewCreateResponse

`func NewCreateResponse(invite AuthTenantInvite, message string, ) *CreateResponse`

NewCreateResponse instantiates a new CreateResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateResponseWithDefaults

`func NewCreateResponseWithDefaults() *CreateResponse`

NewCreateResponseWithDefaults instantiates a new CreateResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetInvite

`func (o *CreateResponse) GetInvite() AuthTenantInvite`

GetInvite returns the Invite field if non-nil, zero value otherwise.

### GetInviteOk

`func (o *CreateResponse) GetInviteOk() (*AuthTenantInvite, bool)`

GetInviteOk returns a tuple with the Invite field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInvite

`func (o *CreateResponse) SetInvite(v AuthTenantInvite)`

SetInvite sets Invite field to given value.


### GetMessage

`func (o *CreateResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *CreateResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *CreateResponse) SetMessage(v string)`

SetMessage sets Message field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


