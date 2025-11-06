# ModelsPriceUI

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**BillingPeriod** | Pointer to **string** |  | [optional] 
**DisplayName** | Pointer to **string** |  | [optional] 
**Features** | Pointer to **[]string** |  | [optional] 
**Limits** | Pointer to [**[]ModelsPriceLimit**](ModelsPriceLimit.md) |  | [optional] 
**PriceDisplay** | Pointer to [**ModelsPriceDisplay**](ModelsPriceDisplay.md) |  | [optional] 

## Methods

### NewModelsPriceUI

`func NewModelsPriceUI() *ModelsPriceUI`

NewModelsPriceUI instantiates a new ModelsPriceUI object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsPriceUIWithDefaults

`func NewModelsPriceUIWithDefaults() *ModelsPriceUI`

NewModelsPriceUIWithDefaults instantiates a new ModelsPriceUI object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetBillingPeriod

`func (o *ModelsPriceUI) GetBillingPeriod() string`

GetBillingPeriod returns the BillingPeriod field if non-nil, zero value otherwise.

### GetBillingPeriodOk

`func (o *ModelsPriceUI) GetBillingPeriodOk() (*string, bool)`

GetBillingPeriodOk returns a tuple with the BillingPeriod field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBillingPeriod

`func (o *ModelsPriceUI) SetBillingPeriod(v string)`

SetBillingPeriod sets BillingPeriod field to given value.

### HasBillingPeriod

`func (o *ModelsPriceUI) HasBillingPeriod() bool`

HasBillingPeriod returns a boolean if a field has been set.

### GetDisplayName

`func (o *ModelsPriceUI) GetDisplayName() string`

GetDisplayName returns the DisplayName field if non-nil, zero value otherwise.

### GetDisplayNameOk

`func (o *ModelsPriceUI) GetDisplayNameOk() (*string, bool)`

GetDisplayNameOk returns a tuple with the DisplayName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDisplayName

`func (o *ModelsPriceUI) SetDisplayName(v string)`

SetDisplayName sets DisplayName field to given value.

### HasDisplayName

`func (o *ModelsPriceUI) HasDisplayName() bool`

HasDisplayName returns a boolean if a field has been set.

### GetFeatures

`func (o *ModelsPriceUI) GetFeatures() []string`

GetFeatures returns the Features field if non-nil, zero value otherwise.

### GetFeaturesOk

`func (o *ModelsPriceUI) GetFeaturesOk() (*[]string, bool)`

GetFeaturesOk returns a tuple with the Features field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFeatures

`func (o *ModelsPriceUI) SetFeatures(v []string)`

SetFeatures sets Features field to given value.

### HasFeatures

`func (o *ModelsPriceUI) HasFeatures() bool`

HasFeatures returns a boolean if a field has been set.

### GetLimits

`func (o *ModelsPriceUI) GetLimits() []ModelsPriceLimit`

GetLimits returns the Limits field if non-nil, zero value otherwise.

### GetLimitsOk

`func (o *ModelsPriceUI) GetLimitsOk() (*[]ModelsPriceLimit, bool)`

GetLimitsOk returns a tuple with the Limits field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLimits

`func (o *ModelsPriceUI) SetLimits(v []ModelsPriceLimit)`

SetLimits sets Limits field to given value.

### HasLimits

`func (o *ModelsPriceUI) HasLimits() bool`

HasLimits returns a boolean if a field has been set.

### GetPriceDisplay

`func (o *ModelsPriceUI) GetPriceDisplay() ModelsPriceDisplay`

GetPriceDisplay returns the PriceDisplay field if non-nil, zero value otherwise.

### GetPriceDisplayOk

`func (o *ModelsPriceUI) GetPriceDisplayOk() (*ModelsPriceDisplay, bool)`

GetPriceDisplayOk returns a tuple with the PriceDisplay field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPriceDisplay

`func (o *ModelsPriceUI) SetPriceDisplay(v ModelsPriceDisplay)`

SetPriceDisplay sets PriceDisplay field to given value.

### HasPriceDisplay

`func (o *ModelsPriceUI) HasPriceDisplay() bool`

HasPriceDisplay returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


