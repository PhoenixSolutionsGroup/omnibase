# PriceUI

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**DisplayName** | Pointer to **string** | Display name for this price tier | [optional] 
**PriceDisplay** | Pointer to [**PriceDisplay**](PriceDisplay.md) |  | [optional] 
**BillingPeriod** | Pointer to **string** | Human-readable billing period | [optional] 
**Features** | Pointer to **[]string** | Features specific to this price | [optional] 
**Limits** | Pointer to [**[]PriceLimit**](PriceLimit.md) | Usage limits for this price | [optional] 

## Methods

### NewPriceUI

`func NewPriceUI() *PriceUI`

NewPriceUI instantiates a new PriceUI object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewPriceUIWithDefaults

`func NewPriceUIWithDefaults() *PriceUI`

NewPriceUIWithDefaults instantiates a new PriceUI object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDisplayName

`func (o *PriceUI) GetDisplayName() string`

GetDisplayName returns the DisplayName field if non-nil, zero value otherwise.

### GetDisplayNameOk

`func (o *PriceUI) GetDisplayNameOk() (*string, bool)`

GetDisplayNameOk returns a tuple with the DisplayName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDisplayName

`func (o *PriceUI) SetDisplayName(v string)`

SetDisplayName sets DisplayName field to given value.

### HasDisplayName

`func (o *PriceUI) HasDisplayName() bool`

HasDisplayName returns a boolean if a field has been set.

### GetPriceDisplay

`func (o *PriceUI) GetPriceDisplay() PriceDisplay`

GetPriceDisplay returns the PriceDisplay field if non-nil, zero value otherwise.

### GetPriceDisplayOk

`func (o *PriceUI) GetPriceDisplayOk() (*PriceDisplay, bool)`

GetPriceDisplayOk returns a tuple with the PriceDisplay field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPriceDisplay

`func (o *PriceUI) SetPriceDisplay(v PriceDisplay)`

SetPriceDisplay sets PriceDisplay field to given value.

### HasPriceDisplay

`func (o *PriceUI) HasPriceDisplay() bool`

HasPriceDisplay returns a boolean if a field has been set.

### GetBillingPeriod

`func (o *PriceUI) GetBillingPeriod() string`

GetBillingPeriod returns the BillingPeriod field if non-nil, zero value otherwise.

### GetBillingPeriodOk

`func (o *PriceUI) GetBillingPeriodOk() (*string, bool)`

GetBillingPeriodOk returns a tuple with the BillingPeriod field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBillingPeriod

`func (o *PriceUI) SetBillingPeriod(v string)`

SetBillingPeriod sets BillingPeriod field to given value.

### HasBillingPeriod

`func (o *PriceUI) HasBillingPeriod() bool`

HasBillingPeriod returns a boolean if a field has been set.

### GetFeatures

`func (o *PriceUI) GetFeatures() []string`

GetFeatures returns the Features field if non-nil, zero value otherwise.

### GetFeaturesOk

`func (o *PriceUI) GetFeaturesOk() (*[]string, bool)`

GetFeaturesOk returns a tuple with the Features field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFeatures

`func (o *PriceUI) SetFeatures(v []string)`

SetFeatures sets Features field to given value.

### HasFeatures

`func (o *PriceUI) HasFeatures() bool`

HasFeatures returns a boolean if a field has been set.

### GetLimits

`func (o *PriceUI) GetLimits() []PriceLimit`

GetLimits returns the Limits field if non-nil, zero value otherwise.

### GetLimitsOk

`func (o *PriceUI) GetLimitsOk() (*[]PriceLimit, bool)`

GetLimitsOk returns a tuple with the Limits field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLimits

`func (o *PriceUI) SetLimits(v []PriceLimit)`

SetLimits sets Limits field to given value.

### HasLimits

`func (o *PriceUI) HasLimits() bool`

HasLimits returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


