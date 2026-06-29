# AddSubscriptionResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**SubscriptionId** | **string** | Stripe Subscription ID | 
**Status** | **string** | Subscription status (active, trialing, etc.) | 
**Message** | **string** | Message confirming the addition | 

## Methods

### NewAddSubscriptionResponse

`func NewAddSubscriptionResponse(subscriptionId string, status string, message string, ) *AddSubscriptionResponse`

NewAddSubscriptionResponse instantiates a new AddSubscriptionResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAddSubscriptionResponseWithDefaults

`func NewAddSubscriptionResponseWithDefaults() *AddSubscriptionResponse`

NewAddSubscriptionResponseWithDefaults instantiates a new AddSubscriptionResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetSubscriptionId

`func (o *AddSubscriptionResponse) GetSubscriptionId() string`

GetSubscriptionId returns the SubscriptionId field if non-nil, zero value otherwise.

### GetSubscriptionIdOk

`func (o *AddSubscriptionResponse) GetSubscriptionIdOk() (*string, bool)`

GetSubscriptionIdOk returns a tuple with the SubscriptionId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubscriptionId

`func (o *AddSubscriptionResponse) SetSubscriptionId(v string)`

SetSubscriptionId sets SubscriptionId field to given value.


### GetStatus

`func (o *AddSubscriptionResponse) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *AddSubscriptionResponse) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *AddSubscriptionResponse) SetStatus(v string)`

SetStatus sets Status field to given value.


### GetMessage

`func (o *AddSubscriptionResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *AddSubscriptionResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *AddSubscriptionResponse) SetMessage(v string)`

SetMessage sets Message field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


