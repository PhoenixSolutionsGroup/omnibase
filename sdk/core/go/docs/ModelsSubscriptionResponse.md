# ModelsSubscriptionResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**CancelAtPeriodEnd** | **bool** |  | 
**CanceledAt** | Pointer to **int32** |  | [optional] 
**ConfigPriceId** | **string** |  | 
**CurrentPeriodEnd** | **int32** |  | 
**CurrentPeriodStart** | **int32** |  | 
**IsLegacyPrice** | **bool** |  | 
**Status** | **string** |  | 
**SubscriptionId** | **string** |  | 
**TrialEnd** | Pointer to **int32** |  | [optional] 
**TrialStart** | Pointer to **int32** |  | [optional] 

## Methods

### NewModelsSubscriptionResponse

`func NewModelsSubscriptionResponse(cancelAtPeriodEnd bool, configPriceId string, currentPeriodEnd int32, currentPeriodStart int32, isLegacyPrice bool, status string, subscriptionId string, ) *ModelsSubscriptionResponse`

NewModelsSubscriptionResponse instantiates a new ModelsSubscriptionResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsSubscriptionResponseWithDefaults

`func NewModelsSubscriptionResponseWithDefaults() *ModelsSubscriptionResponse`

NewModelsSubscriptionResponseWithDefaults instantiates a new ModelsSubscriptionResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCancelAtPeriodEnd

`func (o *ModelsSubscriptionResponse) GetCancelAtPeriodEnd() bool`

GetCancelAtPeriodEnd returns the CancelAtPeriodEnd field if non-nil, zero value otherwise.

### GetCancelAtPeriodEndOk

`func (o *ModelsSubscriptionResponse) GetCancelAtPeriodEndOk() (*bool, bool)`

GetCancelAtPeriodEndOk returns a tuple with the CancelAtPeriodEnd field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCancelAtPeriodEnd

`func (o *ModelsSubscriptionResponse) SetCancelAtPeriodEnd(v bool)`

SetCancelAtPeriodEnd sets CancelAtPeriodEnd field to given value.


### GetCanceledAt

`func (o *ModelsSubscriptionResponse) GetCanceledAt() int32`

GetCanceledAt returns the CanceledAt field if non-nil, zero value otherwise.

### GetCanceledAtOk

`func (o *ModelsSubscriptionResponse) GetCanceledAtOk() (*int32, bool)`

GetCanceledAtOk returns a tuple with the CanceledAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCanceledAt

`func (o *ModelsSubscriptionResponse) SetCanceledAt(v int32)`

SetCanceledAt sets CanceledAt field to given value.

### HasCanceledAt

`func (o *ModelsSubscriptionResponse) HasCanceledAt() bool`

HasCanceledAt returns a boolean if a field has been set.

### GetConfigPriceId

`func (o *ModelsSubscriptionResponse) GetConfigPriceId() string`

GetConfigPriceId returns the ConfigPriceId field if non-nil, zero value otherwise.

### GetConfigPriceIdOk

`func (o *ModelsSubscriptionResponse) GetConfigPriceIdOk() (*string, bool)`

GetConfigPriceIdOk returns a tuple with the ConfigPriceId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfigPriceId

`func (o *ModelsSubscriptionResponse) SetConfigPriceId(v string)`

SetConfigPriceId sets ConfigPriceId field to given value.


### GetCurrentPeriodEnd

`func (o *ModelsSubscriptionResponse) GetCurrentPeriodEnd() int32`

GetCurrentPeriodEnd returns the CurrentPeriodEnd field if non-nil, zero value otherwise.

### GetCurrentPeriodEndOk

`func (o *ModelsSubscriptionResponse) GetCurrentPeriodEndOk() (*int32, bool)`

GetCurrentPeriodEndOk returns a tuple with the CurrentPeriodEnd field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrentPeriodEnd

`func (o *ModelsSubscriptionResponse) SetCurrentPeriodEnd(v int32)`

SetCurrentPeriodEnd sets CurrentPeriodEnd field to given value.


### GetCurrentPeriodStart

`func (o *ModelsSubscriptionResponse) GetCurrentPeriodStart() int32`

GetCurrentPeriodStart returns the CurrentPeriodStart field if non-nil, zero value otherwise.

### GetCurrentPeriodStartOk

`func (o *ModelsSubscriptionResponse) GetCurrentPeriodStartOk() (*int32, bool)`

GetCurrentPeriodStartOk returns a tuple with the CurrentPeriodStart field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrentPeriodStart

`func (o *ModelsSubscriptionResponse) SetCurrentPeriodStart(v int32)`

SetCurrentPeriodStart sets CurrentPeriodStart field to given value.


### GetIsLegacyPrice

`func (o *ModelsSubscriptionResponse) GetIsLegacyPrice() bool`

GetIsLegacyPrice returns the IsLegacyPrice field if non-nil, zero value otherwise.

### GetIsLegacyPriceOk

`func (o *ModelsSubscriptionResponse) GetIsLegacyPriceOk() (*bool, bool)`

GetIsLegacyPriceOk returns a tuple with the IsLegacyPrice field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIsLegacyPrice

`func (o *ModelsSubscriptionResponse) SetIsLegacyPrice(v bool)`

SetIsLegacyPrice sets IsLegacyPrice field to given value.


### GetStatus

`func (o *ModelsSubscriptionResponse) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *ModelsSubscriptionResponse) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *ModelsSubscriptionResponse) SetStatus(v string)`

SetStatus sets Status field to given value.


### GetSubscriptionId

`func (o *ModelsSubscriptionResponse) GetSubscriptionId() string`

GetSubscriptionId returns the SubscriptionId field if non-nil, zero value otherwise.

### GetSubscriptionIdOk

`func (o *ModelsSubscriptionResponse) GetSubscriptionIdOk() (*string, bool)`

GetSubscriptionIdOk returns a tuple with the SubscriptionId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubscriptionId

`func (o *ModelsSubscriptionResponse) SetSubscriptionId(v string)`

SetSubscriptionId sets SubscriptionId field to given value.


### GetTrialEnd

`func (o *ModelsSubscriptionResponse) GetTrialEnd() int32`

GetTrialEnd returns the TrialEnd field if non-nil, zero value otherwise.

### GetTrialEndOk

`func (o *ModelsSubscriptionResponse) GetTrialEndOk() (*int32, bool)`

GetTrialEndOk returns a tuple with the TrialEnd field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTrialEnd

`func (o *ModelsSubscriptionResponse) SetTrialEnd(v int32)`

SetTrialEnd sets TrialEnd field to given value.

### HasTrialEnd

`func (o *ModelsSubscriptionResponse) HasTrialEnd() bool`

HasTrialEnd returns a boolean if a field has been set.

### GetTrialStart

`func (o *ModelsSubscriptionResponse) GetTrialStart() int32`

GetTrialStart returns the TrialStart field if non-nil, zero value otherwise.

### GetTrialStartOk

`func (o *ModelsSubscriptionResponse) GetTrialStartOk() (*int32, bool)`

GetTrialStartOk returns a tuple with the TrialStart field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTrialStart

`func (o *ModelsSubscriptionResponse) SetTrialStart(v int32)`

SetTrialStart sets TrialStart field to given value.

### HasTrialStart

`func (o *ModelsSubscriptionResponse) HasTrialStart() bool`

HasTrialStart returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


