# ModelsPrice

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Amount** | Pointer to **int32** |  | [optional] 
**BillingScheme** | Pointer to **string** | per_unit, tiered | [optional] 
**Currency** | **string** |  | 
**Default** | Pointer to **bool** | mark as default price for the product | [optional] 
**Id** | **string** |  | 
**Interval** | Pointer to **string** | month, year, week, day | [optional] 
**IntervalCount** | Pointer to **int32** | default 1 | [optional] 
**Meter** | Pointer to **string** | meter ID for metered pricing | [optional] 
**Public** | Pointer to **bool** | nil &#x3D; true (default), false &#x3D; hidden from public API | [optional] 
**TaxIncludedInPrice** | Pointer to **bool** | nil &#x3D; false (default) | [optional] 
**Tiers** | Pointer to [**[]ModelsTier**](ModelsTier.md) |  | [optional] 
**TiersMode** | Pointer to **string** | graduated, volume (required when billing_scheme is tiered) | [optional] 
**Ui** | Pointer to [**ModelsPriceUI**](ModelsPriceUI.md) |  | [optional] 
**UsageType** | Pointer to **string** | licensed, metered | [optional] 

## Methods

### NewModelsPrice

`func NewModelsPrice(currency string, id string, ) *ModelsPrice`

NewModelsPrice instantiates a new ModelsPrice object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsPriceWithDefaults

`func NewModelsPriceWithDefaults() *ModelsPrice`

NewModelsPriceWithDefaults instantiates a new ModelsPrice object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAmount

`func (o *ModelsPrice) GetAmount() int32`

GetAmount returns the Amount field if non-nil, zero value otherwise.

### GetAmountOk

`func (o *ModelsPrice) GetAmountOk() (*int32, bool)`

GetAmountOk returns a tuple with the Amount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAmount

`func (o *ModelsPrice) SetAmount(v int32)`

SetAmount sets Amount field to given value.

### HasAmount

`func (o *ModelsPrice) HasAmount() bool`

HasAmount returns a boolean if a field has been set.

### GetBillingScheme

`func (o *ModelsPrice) GetBillingScheme() string`

GetBillingScheme returns the BillingScheme field if non-nil, zero value otherwise.

### GetBillingSchemeOk

`func (o *ModelsPrice) GetBillingSchemeOk() (*string, bool)`

GetBillingSchemeOk returns a tuple with the BillingScheme field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBillingScheme

`func (o *ModelsPrice) SetBillingScheme(v string)`

SetBillingScheme sets BillingScheme field to given value.

### HasBillingScheme

`func (o *ModelsPrice) HasBillingScheme() bool`

HasBillingScheme returns a boolean if a field has been set.

### GetCurrency

`func (o *ModelsPrice) GetCurrency() string`

GetCurrency returns the Currency field if non-nil, zero value otherwise.

### GetCurrencyOk

`func (o *ModelsPrice) GetCurrencyOk() (*string, bool)`

GetCurrencyOk returns a tuple with the Currency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrency

`func (o *ModelsPrice) SetCurrency(v string)`

SetCurrency sets Currency field to given value.


### GetDefault

`func (o *ModelsPrice) GetDefault() bool`

GetDefault returns the Default field if non-nil, zero value otherwise.

### GetDefaultOk

`func (o *ModelsPrice) GetDefaultOk() (*bool, bool)`

GetDefaultOk returns a tuple with the Default field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDefault

`func (o *ModelsPrice) SetDefault(v bool)`

SetDefault sets Default field to given value.

### HasDefault

`func (o *ModelsPrice) HasDefault() bool`

HasDefault returns a boolean if a field has been set.

### GetId

`func (o *ModelsPrice) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ModelsPrice) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ModelsPrice) SetId(v string)`

SetId sets Id field to given value.


### GetInterval

`func (o *ModelsPrice) GetInterval() string`

GetInterval returns the Interval field if non-nil, zero value otherwise.

### GetIntervalOk

`func (o *ModelsPrice) GetIntervalOk() (*string, bool)`

GetIntervalOk returns a tuple with the Interval field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInterval

`func (o *ModelsPrice) SetInterval(v string)`

SetInterval sets Interval field to given value.

### HasInterval

`func (o *ModelsPrice) HasInterval() bool`

HasInterval returns a boolean if a field has been set.

### GetIntervalCount

`func (o *ModelsPrice) GetIntervalCount() int32`

GetIntervalCount returns the IntervalCount field if non-nil, zero value otherwise.

### GetIntervalCountOk

`func (o *ModelsPrice) GetIntervalCountOk() (*int32, bool)`

GetIntervalCountOk returns a tuple with the IntervalCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIntervalCount

`func (o *ModelsPrice) SetIntervalCount(v int32)`

SetIntervalCount sets IntervalCount field to given value.

### HasIntervalCount

`func (o *ModelsPrice) HasIntervalCount() bool`

HasIntervalCount returns a boolean if a field has been set.

### GetMeter

`func (o *ModelsPrice) GetMeter() string`

GetMeter returns the Meter field if non-nil, zero value otherwise.

### GetMeterOk

`func (o *ModelsPrice) GetMeterOk() (*string, bool)`

GetMeterOk returns a tuple with the Meter field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMeter

`func (o *ModelsPrice) SetMeter(v string)`

SetMeter sets Meter field to given value.

### HasMeter

`func (o *ModelsPrice) HasMeter() bool`

HasMeter returns a boolean if a field has been set.

### GetPublic

`func (o *ModelsPrice) GetPublic() bool`

GetPublic returns the Public field if non-nil, zero value otherwise.

### GetPublicOk

`func (o *ModelsPrice) GetPublicOk() (*bool, bool)`

GetPublicOk returns a tuple with the Public field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPublic

`func (o *ModelsPrice) SetPublic(v bool)`

SetPublic sets Public field to given value.

### HasPublic

`func (o *ModelsPrice) HasPublic() bool`

HasPublic returns a boolean if a field has been set.

### GetTaxIncludedInPrice

`func (o *ModelsPrice) GetTaxIncludedInPrice() bool`

GetTaxIncludedInPrice returns the TaxIncludedInPrice field if non-nil, zero value otherwise.

### GetTaxIncludedInPriceOk

`func (o *ModelsPrice) GetTaxIncludedInPriceOk() (*bool, bool)`

GetTaxIncludedInPriceOk returns a tuple with the TaxIncludedInPrice field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTaxIncludedInPrice

`func (o *ModelsPrice) SetTaxIncludedInPrice(v bool)`

SetTaxIncludedInPrice sets TaxIncludedInPrice field to given value.

### HasTaxIncludedInPrice

`func (o *ModelsPrice) HasTaxIncludedInPrice() bool`

HasTaxIncludedInPrice returns a boolean if a field has been set.

### GetTiers

`func (o *ModelsPrice) GetTiers() []ModelsTier`

GetTiers returns the Tiers field if non-nil, zero value otherwise.

### GetTiersOk

`func (o *ModelsPrice) GetTiersOk() (*[]ModelsTier, bool)`

GetTiersOk returns a tuple with the Tiers field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTiers

`func (o *ModelsPrice) SetTiers(v []ModelsTier)`

SetTiers sets Tiers field to given value.

### HasTiers

`func (o *ModelsPrice) HasTiers() bool`

HasTiers returns a boolean if a field has been set.

### GetTiersMode

`func (o *ModelsPrice) GetTiersMode() string`

GetTiersMode returns the TiersMode field if non-nil, zero value otherwise.

### GetTiersModeOk

`func (o *ModelsPrice) GetTiersModeOk() (*string, bool)`

GetTiersModeOk returns a tuple with the TiersMode field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTiersMode

`func (o *ModelsPrice) SetTiersMode(v string)`

SetTiersMode sets TiersMode field to given value.

### HasTiersMode

`func (o *ModelsPrice) HasTiersMode() bool`

HasTiersMode returns a boolean if a field has been set.

### GetUi

`func (o *ModelsPrice) GetUi() ModelsPriceUI`

GetUi returns the Ui field if non-nil, zero value otherwise.

### GetUiOk

`func (o *ModelsPrice) GetUiOk() (*ModelsPriceUI, bool)`

GetUiOk returns a tuple with the Ui field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUi

`func (o *ModelsPrice) SetUi(v ModelsPriceUI)`

SetUi sets Ui field to given value.

### HasUi

`func (o *ModelsPrice) HasUi() bool`

HasUi returns a boolean if a field has been set.

### GetUsageType

`func (o *ModelsPrice) GetUsageType() string`

GetUsageType returns the UsageType field if non-nil, zero value otherwise.

### GetUsageTypeOk

`func (o *ModelsPrice) GetUsageTypeOk() (*string, bool)`

GetUsageTypeOk returns a tuple with the UsageType field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUsageType

`func (o *ModelsPrice) SetUsageType(v string)`

SetUsageType sets UsageType field to given value.

### HasUsageType

`func (o *ModelsPrice) HasUsageType() bool`

HasUsageType returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


