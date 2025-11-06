# V1CreateCheckoutRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**AllowPromotionCodes** | Pointer to **bool** | Whether to allow promotion codes to be entered | [optional] 
**CancelUrl** | **string** | URL to redirect to if checkout is cancelled | 
**PriceId** | **string** | The price ID from your Stripe configuration | 
**PromotionCode** | Pointer to **string** | Optional promotion code to apply | [optional] 
**SuccessUrl** | **string** | URL to redirect to after successful checkout | 
**TrialPeriodDays** | Pointer to **int32** | Optional trial period in days | [optional] 

## Methods

### NewV1CreateCheckoutRequest

`func NewV1CreateCheckoutRequest(cancelUrl string, priceId string, successUrl string, ) *V1CreateCheckoutRequest`

NewV1CreateCheckoutRequest instantiates a new V1CreateCheckoutRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewV1CreateCheckoutRequestWithDefaults

`func NewV1CreateCheckoutRequestWithDefaults() *V1CreateCheckoutRequest`

NewV1CreateCheckoutRequestWithDefaults instantiates a new V1CreateCheckoutRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAllowPromotionCodes

`func (o *V1CreateCheckoutRequest) GetAllowPromotionCodes() bool`

GetAllowPromotionCodes returns the AllowPromotionCodes field if non-nil, zero value otherwise.

### GetAllowPromotionCodesOk

`func (o *V1CreateCheckoutRequest) GetAllowPromotionCodesOk() (*bool, bool)`

GetAllowPromotionCodesOk returns a tuple with the AllowPromotionCodes field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAllowPromotionCodes

`func (o *V1CreateCheckoutRequest) SetAllowPromotionCodes(v bool)`

SetAllowPromotionCodes sets AllowPromotionCodes field to given value.

### HasAllowPromotionCodes

`func (o *V1CreateCheckoutRequest) HasAllowPromotionCodes() bool`

HasAllowPromotionCodes returns a boolean if a field has been set.

### GetCancelUrl

`func (o *V1CreateCheckoutRequest) GetCancelUrl() string`

GetCancelUrl returns the CancelUrl field if non-nil, zero value otherwise.

### GetCancelUrlOk

`func (o *V1CreateCheckoutRequest) GetCancelUrlOk() (*string, bool)`

GetCancelUrlOk returns a tuple with the CancelUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCancelUrl

`func (o *V1CreateCheckoutRequest) SetCancelUrl(v string)`

SetCancelUrl sets CancelUrl field to given value.


### GetPriceId

`func (o *V1CreateCheckoutRequest) GetPriceId() string`

GetPriceId returns the PriceId field if non-nil, zero value otherwise.

### GetPriceIdOk

`func (o *V1CreateCheckoutRequest) GetPriceIdOk() (*string, bool)`

GetPriceIdOk returns a tuple with the PriceId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPriceId

`func (o *V1CreateCheckoutRequest) SetPriceId(v string)`

SetPriceId sets PriceId field to given value.


### GetPromotionCode

`func (o *V1CreateCheckoutRequest) GetPromotionCode() string`

GetPromotionCode returns the PromotionCode field if non-nil, zero value otherwise.

### GetPromotionCodeOk

`func (o *V1CreateCheckoutRequest) GetPromotionCodeOk() (*string, bool)`

GetPromotionCodeOk returns a tuple with the PromotionCode field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPromotionCode

`func (o *V1CreateCheckoutRequest) SetPromotionCode(v string)`

SetPromotionCode sets PromotionCode field to given value.

### HasPromotionCode

`func (o *V1CreateCheckoutRequest) HasPromotionCode() bool`

HasPromotionCode returns a boolean if a field has been set.

### GetSuccessUrl

`func (o *V1CreateCheckoutRequest) GetSuccessUrl() string`

GetSuccessUrl returns the SuccessUrl field if non-nil, zero value otherwise.

### GetSuccessUrlOk

`func (o *V1CreateCheckoutRequest) GetSuccessUrlOk() (*string, bool)`

GetSuccessUrlOk returns a tuple with the SuccessUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSuccessUrl

`func (o *V1CreateCheckoutRequest) SetSuccessUrl(v string)`

SetSuccessUrl sets SuccessUrl field to given value.


### GetTrialPeriodDays

`func (o *V1CreateCheckoutRequest) GetTrialPeriodDays() int32`

GetTrialPeriodDays returns the TrialPeriodDays field if non-nil, zero value otherwise.

### GetTrialPeriodDaysOk

`func (o *V1CreateCheckoutRequest) GetTrialPeriodDaysOk() (*int32, bool)`

GetTrialPeriodDaysOk returns a tuple with the TrialPeriodDays field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTrialPeriodDays

`func (o *V1CreateCheckoutRequest) SetTrialPeriodDays(v int32)`

SetTrialPeriodDays sets TrialPeriodDays field to given value.

### HasTrialPeriodDays

`func (o *V1CreateCheckoutRequest) HasTrialPeriodDays() bool`

HasTrialPeriodDays returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


