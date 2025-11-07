# TenantsRemoveSubscriptionResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | Pointer to **string** | Message confirming the cancellation | [optional] 
**Status** | Pointer to **string** | Subscription status after cancellation | [optional] 
**SubscriptionId** | Pointer to **string** | Stripe Subscription ID that was canceled | [optional] 

## Methods

### NewTenantsRemoveSubscriptionResponse

`func NewTenantsRemoveSubscriptionResponse() *TenantsRemoveSubscriptionResponse`

NewTenantsRemoveSubscriptionResponse instantiates a new TenantsRemoveSubscriptionResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTenantsRemoveSubscriptionResponseWithDefaults

`func NewTenantsRemoveSubscriptionResponseWithDefaults() *TenantsRemoveSubscriptionResponse`

NewTenantsRemoveSubscriptionResponseWithDefaults instantiates a new TenantsRemoveSubscriptionResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMessage

`func (o *TenantsRemoveSubscriptionResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *TenantsRemoveSubscriptionResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *TenantsRemoveSubscriptionResponse) SetMessage(v string)`

SetMessage sets Message field to given value.

### HasMessage

`func (o *TenantsRemoveSubscriptionResponse) HasMessage() bool`

HasMessage returns a boolean if a field has been set.

### GetStatus

`func (o *TenantsRemoveSubscriptionResponse) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *TenantsRemoveSubscriptionResponse) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *TenantsRemoveSubscriptionResponse) SetStatus(v string)`

SetStatus sets Status field to given value.

### HasStatus

`func (o *TenantsRemoveSubscriptionResponse) HasStatus() bool`

HasStatus returns a boolean if a field has been set.

### GetSubscriptionId

`func (o *TenantsRemoveSubscriptionResponse) GetSubscriptionId() string`

GetSubscriptionId returns the SubscriptionId field if non-nil, zero value otherwise.

### GetSubscriptionIdOk

`func (o *TenantsRemoveSubscriptionResponse) GetSubscriptionIdOk() (*string, bool)`

GetSubscriptionIdOk returns a tuple with the SubscriptionId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubscriptionId

`func (o *TenantsRemoveSubscriptionResponse) SetSubscriptionId(v string)`

SetSubscriptionId sets SubscriptionId field to given value.

### HasSubscriptionId

`func (o *TenantsRemoveSubscriptionResponse) HasSubscriptionId() bool`

HasSubscriptionId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


