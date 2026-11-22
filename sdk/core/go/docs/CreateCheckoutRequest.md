# CreateCheckoutRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**AllowPromotionCodes** | Pointer to **bool** |  | [optional] 
**CancelUrl** | **string** |  | 
**LineItems** | [**[]LineItem**](LineItem.md) |  | 
**PromotionCode** | Pointer to **string** |  | [optional] 
**SuccessUrl** | **string** |  | 
**TrialPeriodDays** | Pointer to **int64** |  | [optional] 

## Methods

### NewCreateCheckoutRequest

`func NewCreateCheckoutRequest(cancelUrl string, lineItems []LineItem, successUrl string, ) *CreateCheckoutRequest`

NewCreateCheckoutRequest instantiates a new CreateCheckoutRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateCheckoutRequestWithDefaults

`func NewCreateCheckoutRequestWithDefaults() *CreateCheckoutRequest`

NewCreateCheckoutRequestWithDefaults instantiates a new CreateCheckoutRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAllowPromotionCodes

`func (o *CreateCheckoutRequest) GetAllowPromotionCodes() bool`

GetAllowPromotionCodes returns the AllowPromotionCodes field if non-nil, zero value otherwise.

### GetAllowPromotionCodesOk

`func (o *CreateCheckoutRequest) GetAllowPromotionCodesOk() (*bool, bool)`

GetAllowPromotionCodesOk returns a tuple with the AllowPromotionCodes field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAllowPromotionCodes

`func (o *CreateCheckoutRequest) SetAllowPromotionCodes(v bool)`

SetAllowPromotionCodes sets AllowPromotionCodes field to given value.

### HasAllowPromotionCodes

`func (o *CreateCheckoutRequest) HasAllowPromotionCodes() bool`

HasAllowPromotionCodes returns a boolean if a field has been set.

### GetCancelUrl

`func (o *CreateCheckoutRequest) GetCancelUrl() string`

GetCancelUrl returns the CancelUrl field if non-nil, zero value otherwise.

### GetCancelUrlOk

`func (o *CreateCheckoutRequest) GetCancelUrlOk() (*string, bool)`

GetCancelUrlOk returns a tuple with the CancelUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCancelUrl

`func (o *CreateCheckoutRequest) SetCancelUrl(v string)`

SetCancelUrl sets CancelUrl field to given value.


### GetLineItems

`func (o *CreateCheckoutRequest) GetLineItems() []LineItem`

GetLineItems returns the LineItems field if non-nil, zero value otherwise.

### GetLineItemsOk

`func (o *CreateCheckoutRequest) GetLineItemsOk() (*[]LineItem, bool)`

GetLineItemsOk returns a tuple with the LineItems field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLineItems

`func (o *CreateCheckoutRequest) SetLineItems(v []LineItem)`

SetLineItems sets LineItems field to given value.


### SetLineItemsNil

`func (o *CreateCheckoutRequest) SetLineItemsNil(b bool)`

 SetLineItemsNil sets the value for LineItems to be an explicit nil

### UnsetLineItems
`func (o *CreateCheckoutRequest) UnsetLineItems()`

UnsetLineItems ensures that no value is present for LineItems, not even an explicit nil
### GetPromotionCode

`func (o *CreateCheckoutRequest) GetPromotionCode() string`

GetPromotionCode returns the PromotionCode field if non-nil, zero value otherwise.

### GetPromotionCodeOk

`func (o *CreateCheckoutRequest) GetPromotionCodeOk() (*string, bool)`

GetPromotionCodeOk returns a tuple with the PromotionCode field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPromotionCode

`func (o *CreateCheckoutRequest) SetPromotionCode(v string)`

SetPromotionCode sets PromotionCode field to given value.

### HasPromotionCode

`func (o *CreateCheckoutRequest) HasPromotionCode() bool`

HasPromotionCode returns a boolean if a field has been set.

### GetSuccessUrl

`func (o *CreateCheckoutRequest) GetSuccessUrl() string`

GetSuccessUrl returns the SuccessUrl field if non-nil, zero value otherwise.

### GetSuccessUrlOk

`func (o *CreateCheckoutRequest) GetSuccessUrlOk() (*string, bool)`

GetSuccessUrlOk returns a tuple with the SuccessUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSuccessUrl

`func (o *CreateCheckoutRequest) SetSuccessUrl(v string)`

SetSuccessUrl sets SuccessUrl field to given value.


### GetTrialPeriodDays

`func (o *CreateCheckoutRequest) GetTrialPeriodDays() int64`

GetTrialPeriodDays returns the TrialPeriodDays field if non-nil, zero value otherwise.

### GetTrialPeriodDaysOk

`func (o *CreateCheckoutRequest) GetTrialPeriodDaysOk() (*int64, bool)`

GetTrialPeriodDaysOk returns a tuple with the TrialPeriodDays field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTrialPeriodDays

`func (o *CreateCheckoutRequest) SetTrialPeriodDays(v int64)`

SetTrialPeriodDays sets TrialPeriodDays field to given value.

### HasTrialPeriodDays

`func (o *CreateCheckoutRequest) HasTrialPeriodDays() bool`

HasTrialPeriodDays returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


