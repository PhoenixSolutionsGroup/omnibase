# ModelsPriceWithStripeID

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
**StripeId** | Pointer to **string** | actual Stripe price ID (null for free prices) | [optional] 
**TaxIncludedInPrice** | Pointer to **bool** | nil &#x3D; false (default) | [optional] 
**Tiers** | Pointer to [**[]ModelsTier**](ModelsTier.md) |  | [optional] 
**TiersMode** | Pointer to **string** | graduated, volume (required when billing_scheme is tiered) | [optional] 
**Ui** | Pointer to [**ModelsPriceUI**](ModelsPriceUI.md) |  | [optional] 
**UsageType** | Pointer to **string** | licensed, metered | [optional] 

## Methods

### NewModelsPriceWithStripeID

`func NewModelsPriceWithStripeID(currency string, id string, ) *ModelsPriceWithStripeID`

NewModelsPriceWithStripeID instantiates a new ModelsPriceWithStripeID object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsPriceWithStripeIDWithDefaults

`func NewModelsPriceWithStripeIDWithDefaults() *ModelsPriceWithStripeID`

NewModelsPriceWithStripeIDWithDefaults instantiates a new ModelsPriceWithStripeID object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAmount

`func (o *ModelsPriceWithStripeID) GetAmount() int32`

GetAmount returns the Amount field if non-nil, zero value otherwise.

### GetAmountOk

`func (o *ModelsPriceWithStripeID) GetAmountOk() (*int32, bool)`

GetAmountOk returns a tuple with the Amount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAmount

`func (o *ModelsPriceWithStripeID) SetAmount(v int32)`

SetAmount sets Amount field to given value.

### HasAmount

`func (o *ModelsPriceWithStripeID) HasAmount() bool`

HasAmount returns a boolean if a field has been set.

### GetBillingScheme

`func (o *ModelsPriceWithStripeID) GetBillingScheme() string`

GetBillingScheme returns the BillingScheme field if non-nil, zero value otherwise.

### GetBillingSchemeOk

`func (o *ModelsPriceWithStripeID) GetBillingSchemeOk() (*string, bool)`

GetBillingSchemeOk returns a tuple with the BillingScheme field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBillingScheme

`func (o *ModelsPriceWithStripeID) SetBillingScheme(v string)`

SetBillingScheme sets BillingScheme field to given value.

### HasBillingScheme

`func (o *ModelsPriceWithStripeID) HasBillingScheme() bool`

HasBillingScheme returns a boolean if a field has been set.

### GetCurrency

`func (o *ModelsPriceWithStripeID) GetCurrency() string`

GetCurrency returns the Currency field if non-nil, zero value otherwise.

### GetCurrencyOk

`func (o *ModelsPriceWithStripeID) GetCurrencyOk() (*string, bool)`

GetCurrencyOk returns a tuple with the Currency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrency

`func (o *ModelsPriceWithStripeID) SetCurrency(v string)`

SetCurrency sets Currency field to given value.


### GetDefault

`func (o *ModelsPriceWithStripeID) GetDefault() bool`

GetDefault returns the Default field if non-nil, zero value otherwise.

### GetDefaultOk

`func (o *ModelsPriceWithStripeID) GetDefaultOk() (*bool, bool)`

GetDefaultOk returns a tuple with the Default field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDefault

`func (o *ModelsPriceWithStripeID) SetDefault(v bool)`

SetDefault sets Default field to given value.

### HasDefault

`func (o *ModelsPriceWithStripeID) HasDefault() bool`

HasDefault returns a boolean if a field has been set.

### GetId

`func (o *ModelsPriceWithStripeID) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ModelsPriceWithStripeID) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ModelsPriceWithStripeID) SetId(v string)`

SetId sets Id field to given value.


### GetInterval

`func (o *ModelsPriceWithStripeID) GetInterval() string`

GetInterval returns the Interval field if non-nil, zero value otherwise.

### GetIntervalOk

`func (o *ModelsPriceWithStripeID) GetIntervalOk() (*string, bool)`

GetIntervalOk returns a tuple with the Interval field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInterval

`func (o *ModelsPriceWithStripeID) SetInterval(v string)`

SetInterval sets Interval field to given value.

### HasInterval

`func (o *ModelsPriceWithStripeID) HasInterval() bool`

HasInterval returns a boolean if a field has been set.

### GetIntervalCount

`func (o *ModelsPriceWithStripeID) GetIntervalCount() int32`

GetIntervalCount returns the IntervalCount field if non-nil, zero value otherwise.

### GetIntervalCountOk

`func (o *ModelsPriceWithStripeID) GetIntervalCountOk() (*int32, bool)`

GetIntervalCountOk returns a tuple with the IntervalCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIntervalCount

`func (o *ModelsPriceWithStripeID) SetIntervalCount(v int32)`

SetIntervalCount sets IntervalCount field to given value.

### HasIntervalCount

`func (o *ModelsPriceWithStripeID) HasIntervalCount() bool`

HasIntervalCount returns a boolean if a field has been set.

### GetMeter

`func (o *ModelsPriceWithStripeID) GetMeter() string`

GetMeter returns the Meter field if non-nil, zero value otherwise.

### GetMeterOk

`func (o *ModelsPriceWithStripeID) GetMeterOk() (*string, bool)`

GetMeterOk returns a tuple with the Meter field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMeter

`func (o *ModelsPriceWithStripeID) SetMeter(v string)`

SetMeter sets Meter field to given value.

### HasMeter

`func (o *ModelsPriceWithStripeID) HasMeter() bool`

HasMeter returns a boolean if a field has been set.

### GetPublic

`func (o *ModelsPriceWithStripeID) GetPublic() bool`

GetPublic returns the Public field if non-nil, zero value otherwise.

### GetPublicOk

`func (o *ModelsPriceWithStripeID) GetPublicOk() (*bool, bool)`

GetPublicOk returns a tuple with the Public field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPublic

`func (o *ModelsPriceWithStripeID) SetPublic(v bool)`

SetPublic sets Public field to given value.

### HasPublic

`func (o *ModelsPriceWithStripeID) HasPublic() bool`

HasPublic returns a boolean if a field has been set.

### GetStripeId

`func (o *ModelsPriceWithStripeID) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *ModelsPriceWithStripeID) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *ModelsPriceWithStripeID) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *ModelsPriceWithStripeID) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.

### GetTaxIncludedInPrice

`func (o *ModelsPriceWithStripeID) GetTaxIncludedInPrice() bool`

GetTaxIncludedInPrice returns the TaxIncludedInPrice field if non-nil, zero value otherwise.

### GetTaxIncludedInPriceOk

`func (o *ModelsPriceWithStripeID) GetTaxIncludedInPriceOk() (*bool, bool)`

GetTaxIncludedInPriceOk returns a tuple with the TaxIncludedInPrice field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTaxIncludedInPrice

`func (o *ModelsPriceWithStripeID) SetTaxIncludedInPrice(v bool)`

SetTaxIncludedInPrice sets TaxIncludedInPrice field to given value.

### HasTaxIncludedInPrice

`func (o *ModelsPriceWithStripeID) HasTaxIncludedInPrice() bool`

HasTaxIncludedInPrice returns a boolean if a field has been set.

### GetTiers

`func (o *ModelsPriceWithStripeID) GetTiers() []ModelsTier`

GetTiers returns the Tiers field if non-nil, zero value otherwise.

### GetTiersOk

`func (o *ModelsPriceWithStripeID) GetTiersOk() (*[]ModelsTier, bool)`

GetTiersOk returns a tuple with the Tiers field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTiers

`func (o *ModelsPriceWithStripeID) SetTiers(v []ModelsTier)`

SetTiers sets Tiers field to given value.

### HasTiers

`func (o *ModelsPriceWithStripeID) HasTiers() bool`

HasTiers returns a boolean if a field has been set.

### GetTiersMode

`func (o *ModelsPriceWithStripeID) GetTiersMode() string`

GetTiersMode returns the TiersMode field if non-nil, zero value otherwise.

### GetTiersModeOk

`func (o *ModelsPriceWithStripeID) GetTiersModeOk() (*string, bool)`

GetTiersModeOk returns a tuple with the TiersMode field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTiersMode

`func (o *ModelsPriceWithStripeID) SetTiersMode(v string)`

SetTiersMode sets TiersMode field to given value.

### HasTiersMode

`func (o *ModelsPriceWithStripeID) HasTiersMode() bool`

HasTiersMode returns a boolean if a field has been set.

### GetUi

`func (o *ModelsPriceWithStripeID) GetUi() ModelsPriceUI`

GetUi returns the Ui field if non-nil, zero value otherwise.

### GetUiOk

`func (o *ModelsPriceWithStripeID) GetUiOk() (*ModelsPriceUI, bool)`

GetUiOk returns a tuple with the Ui field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUi

`func (o *ModelsPriceWithStripeID) SetUi(v ModelsPriceUI)`

SetUi sets Ui field to given value.

### HasUi

`func (o *ModelsPriceWithStripeID) HasUi() bool`

HasUi returns a boolean if a field has been set.

### GetUsageType

`func (o *ModelsPriceWithStripeID) GetUsageType() string`

GetUsageType returns the UsageType field if non-nil, zero value otherwise.

### GetUsageTypeOk

`func (o *ModelsPriceWithStripeID) GetUsageTypeOk() (*string, bool)`

GetUsageTypeOk returns a tuple with the UsageType field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUsageType

`func (o *ModelsPriceWithStripeID) SetUsageType(v string)`

SetUsageType sets UsageType field to given value.

### HasUsageType

`func (o *ModelsPriceWithStripeID) HasUsageType() bool`

HasUsageType returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


