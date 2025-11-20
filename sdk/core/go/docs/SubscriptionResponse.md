# SubscriptionResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**SubscriptionId** | **string** | Stripe subscription ID | 
**ConfigPriceId** | **string** | Configuration price ID | 
**Status** | **string** | Subscription status | 
**CurrentPeriodStart** | **int64** | Unix timestamp of current period start | 
**CurrentPeriodEnd** | **int64** | Unix timestamp of current period end | 
**CancelAtPeriodEnd** | **bool** | Whether subscription will cancel at period end | 
**CanceledAt** | Pointer to **int64** | Unix timestamp when subscription was canceled | [optional] 
**TrialStart** | Pointer to **int64** | Unix timestamp when trial started | [optional] 
**TrialEnd** | Pointer to **int64** | Unix timestamp when trial ends | [optional] 
**IsLegacyPrice** | **bool** | Whether this is a legacy price | 

## Methods

### NewSubscriptionResponse

`func NewSubscriptionResponse(subscriptionId string, configPriceId string, status string, currentPeriodStart int64, currentPeriodEnd int64, cancelAtPeriodEnd bool, isLegacyPrice bool, ) *SubscriptionResponse`

NewSubscriptionResponse instantiates a new SubscriptionResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSubscriptionResponseWithDefaults

`func NewSubscriptionResponseWithDefaults() *SubscriptionResponse`

NewSubscriptionResponseWithDefaults instantiates a new SubscriptionResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetSubscriptionId

`func (o *SubscriptionResponse) GetSubscriptionId() string`

GetSubscriptionId returns the SubscriptionId field if non-nil, zero value otherwise.

### GetSubscriptionIdOk

`func (o *SubscriptionResponse) GetSubscriptionIdOk() (*string, bool)`

GetSubscriptionIdOk returns a tuple with the SubscriptionId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubscriptionId

`func (o *SubscriptionResponse) SetSubscriptionId(v string)`

SetSubscriptionId sets SubscriptionId field to given value.


### GetConfigPriceId

`func (o *SubscriptionResponse) GetConfigPriceId() string`

GetConfigPriceId returns the ConfigPriceId field if non-nil, zero value otherwise.

### GetConfigPriceIdOk

`func (o *SubscriptionResponse) GetConfigPriceIdOk() (*string, bool)`

GetConfigPriceIdOk returns a tuple with the ConfigPriceId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfigPriceId

`func (o *SubscriptionResponse) SetConfigPriceId(v string)`

SetConfigPriceId sets ConfigPriceId field to given value.


### GetStatus

`func (o *SubscriptionResponse) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *SubscriptionResponse) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *SubscriptionResponse) SetStatus(v string)`

SetStatus sets Status field to given value.


### GetCurrentPeriodStart

`func (o *SubscriptionResponse) GetCurrentPeriodStart() int64`

GetCurrentPeriodStart returns the CurrentPeriodStart field if non-nil, zero value otherwise.

### GetCurrentPeriodStartOk

`func (o *SubscriptionResponse) GetCurrentPeriodStartOk() (*int64, bool)`

GetCurrentPeriodStartOk returns a tuple with the CurrentPeriodStart field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrentPeriodStart

`func (o *SubscriptionResponse) SetCurrentPeriodStart(v int64)`

SetCurrentPeriodStart sets CurrentPeriodStart field to given value.


### GetCurrentPeriodEnd

`func (o *SubscriptionResponse) GetCurrentPeriodEnd() int64`

GetCurrentPeriodEnd returns the CurrentPeriodEnd field if non-nil, zero value otherwise.

### GetCurrentPeriodEndOk

`func (o *SubscriptionResponse) GetCurrentPeriodEndOk() (*int64, bool)`

GetCurrentPeriodEndOk returns a tuple with the CurrentPeriodEnd field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrentPeriodEnd

`func (o *SubscriptionResponse) SetCurrentPeriodEnd(v int64)`

SetCurrentPeriodEnd sets CurrentPeriodEnd field to given value.


### GetCancelAtPeriodEnd

`func (o *SubscriptionResponse) GetCancelAtPeriodEnd() bool`

GetCancelAtPeriodEnd returns the CancelAtPeriodEnd field if non-nil, zero value otherwise.

### GetCancelAtPeriodEndOk

`func (o *SubscriptionResponse) GetCancelAtPeriodEndOk() (*bool, bool)`

GetCancelAtPeriodEndOk returns a tuple with the CancelAtPeriodEnd field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCancelAtPeriodEnd

`func (o *SubscriptionResponse) SetCancelAtPeriodEnd(v bool)`

SetCancelAtPeriodEnd sets CancelAtPeriodEnd field to given value.


### GetCanceledAt

`func (o *SubscriptionResponse) GetCanceledAt() int64`

GetCanceledAt returns the CanceledAt field if non-nil, zero value otherwise.

### GetCanceledAtOk

`func (o *SubscriptionResponse) GetCanceledAtOk() (*int64, bool)`

GetCanceledAtOk returns a tuple with the CanceledAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCanceledAt

`func (o *SubscriptionResponse) SetCanceledAt(v int64)`

SetCanceledAt sets CanceledAt field to given value.

### HasCanceledAt

`func (o *SubscriptionResponse) HasCanceledAt() bool`

HasCanceledAt returns a boolean if a field has been set.

### GetTrialStart

`func (o *SubscriptionResponse) GetTrialStart() int64`

GetTrialStart returns the TrialStart field if non-nil, zero value otherwise.

### GetTrialStartOk

`func (o *SubscriptionResponse) GetTrialStartOk() (*int64, bool)`

GetTrialStartOk returns a tuple with the TrialStart field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTrialStart

`func (o *SubscriptionResponse) SetTrialStart(v int64)`

SetTrialStart sets TrialStart field to given value.

### HasTrialStart

`func (o *SubscriptionResponse) HasTrialStart() bool`

HasTrialStart returns a boolean if a field has been set.

### GetTrialEnd

`func (o *SubscriptionResponse) GetTrialEnd() int64`

GetTrialEnd returns the TrialEnd field if non-nil, zero value otherwise.

### GetTrialEndOk

`func (o *SubscriptionResponse) GetTrialEndOk() (*int64, bool)`

GetTrialEndOk returns a tuple with the TrialEnd field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTrialEnd

`func (o *SubscriptionResponse) SetTrialEnd(v int64)`

SetTrialEnd sets TrialEnd field to given value.

### HasTrialEnd

`func (o *SubscriptionResponse) HasTrialEnd() bool`

HasTrialEnd returns a boolean if a field has been set.

### GetIsLegacyPrice

`func (o *SubscriptionResponse) GetIsLegacyPrice() bool`

GetIsLegacyPrice returns the IsLegacyPrice field if non-nil, zero value otherwise.

### GetIsLegacyPriceOk

`func (o *SubscriptionResponse) GetIsLegacyPriceOk() (*bool, bool)`

GetIsLegacyPriceOk returns a tuple with the IsLegacyPrice field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIsLegacyPrice

`func (o *SubscriptionResponse) SetIsLegacyPrice(v bool)`

SetIsLegacyPrice sets IsLegacyPrice field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


