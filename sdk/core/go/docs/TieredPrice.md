# TieredPrice

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** | Price identifier (config ID) | 
**StripeId** | Pointer to **string** | Original Stripe ID for migration support (optional, used to link existing Stripe prices) | [optional] 
**Public** | Pointer to **bool** | Whether price is visible in public API (null/true &#x3D; public, false &#x3D; enterprise only) | [optional] 
**TaxIncludedInPrice** | Pointer to **bool** | Whether tax is included in the price (null/false &#x3D; exclusive) | [optional] 
**Currency** | **string** | Three-letter ISO currency code (lowercase) | 
**Interval** | Pointer to **string** | Billing interval for recurring prices (required when usage_type is metered) | [optional] 
**IntervalCount** | Pointer to **int32** | Number of intervals between billings (default 1) | [optional] 
**UsageType** | Pointer to **string** | Usage type for recurring prices (when set to metered, interval and meter are required) | [optional] 
**Meter** | Pointer to **string** | Meter ID for metered pricing (required when usage_type is metered, must reference a meter defined in the meters array) | [optional] 
**BillingScheme** | **string** | Billing scheme type (must be &#39;tiered&#39;) | 
**TiersMode** | **string** | Tiers mode | 
**Tiers** | [**[]Tier**](Tier.md) | Pricing tiers | 
**Default** | Pointer to **bool** | Mark as default price for the product | [optional] 
**Ui** | Pointer to [**PriceUI**](PriceUI.md) |  | [optional] 

## Methods

### NewTieredPrice

`func NewTieredPrice(id string, currency string, billingScheme string, tiersMode string, tiers []Tier, ) *TieredPrice`

NewTieredPrice instantiates a new TieredPrice object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTieredPriceWithDefaults

`func NewTieredPriceWithDefaults() *TieredPrice`

NewTieredPriceWithDefaults instantiates a new TieredPrice object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *TieredPrice) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *TieredPrice) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *TieredPrice) SetId(v string)`

SetId sets Id field to given value.


### GetStripeId

`func (o *TieredPrice) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *TieredPrice) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *TieredPrice) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *TieredPrice) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.

### GetPublic

`func (o *TieredPrice) GetPublic() bool`

GetPublic returns the Public field if non-nil, zero value otherwise.

### GetPublicOk

`func (o *TieredPrice) GetPublicOk() (*bool, bool)`

GetPublicOk returns a tuple with the Public field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPublic

`func (o *TieredPrice) SetPublic(v bool)`

SetPublic sets Public field to given value.

### HasPublic

`func (o *TieredPrice) HasPublic() bool`

HasPublic returns a boolean if a field has been set.

### GetTaxIncludedInPrice

`func (o *TieredPrice) GetTaxIncludedInPrice() bool`

GetTaxIncludedInPrice returns the TaxIncludedInPrice field if non-nil, zero value otherwise.

### GetTaxIncludedInPriceOk

`func (o *TieredPrice) GetTaxIncludedInPriceOk() (*bool, bool)`

GetTaxIncludedInPriceOk returns a tuple with the TaxIncludedInPrice field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTaxIncludedInPrice

`func (o *TieredPrice) SetTaxIncludedInPrice(v bool)`

SetTaxIncludedInPrice sets TaxIncludedInPrice field to given value.

### HasTaxIncludedInPrice

`func (o *TieredPrice) HasTaxIncludedInPrice() bool`

HasTaxIncludedInPrice returns a boolean if a field has been set.

### GetCurrency

`func (o *TieredPrice) GetCurrency() string`

GetCurrency returns the Currency field if non-nil, zero value otherwise.

### GetCurrencyOk

`func (o *TieredPrice) GetCurrencyOk() (*string, bool)`

GetCurrencyOk returns a tuple with the Currency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrency

`func (o *TieredPrice) SetCurrency(v string)`

SetCurrency sets Currency field to given value.


### GetInterval

`func (o *TieredPrice) GetInterval() string`

GetInterval returns the Interval field if non-nil, zero value otherwise.

### GetIntervalOk

`func (o *TieredPrice) GetIntervalOk() (*string, bool)`

GetIntervalOk returns a tuple with the Interval field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInterval

`func (o *TieredPrice) SetInterval(v string)`

SetInterval sets Interval field to given value.

### HasInterval

`func (o *TieredPrice) HasInterval() bool`

HasInterval returns a boolean if a field has been set.

### GetIntervalCount

`func (o *TieredPrice) GetIntervalCount() int32`

GetIntervalCount returns the IntervalCount field if non-nil, zero value otherwise.

### GetIntervalCountOk

`func (o *TieredPrice) GetIntervalCountOk() (*int32, bool)`

GetIntervalCountOk returns a tuple with the IntervalCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIntervalCount

`func (o *TieredPrice) SetIntervalCount(v int32)`

SetIntervalCount sets IntervalCount field to given value.

### HasIntervalCount

`func (o *TieredPrice) HasIntervalCount() bool`

HasIntervalCount returns a boolean if a field has been set.

### GetUsageType

`func (o *TieredPrice) GetUsageType() string`

GetUsageType returns the UsageType field if non-nil, zero value otherwise.

### GetUsageTypeOk

`func (o *TieredPrice) GetUsageTypeOk() (*string, bool)`

GetUsageTypeOk returns a tuple with the UsageType field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUsageType

`func (o *TieredPrice) SetUsageType(v string)`

SetUsageType sets UsageType field to given value.

### HasUsageType

`func (o *TieredPrice) HasUsageType() bool`

HasUsageType returns a boolean if a field has been set.

### GetMeter

`func (o *TieredPrice) GetMeter() string`

GetMeter returns the Meter field if non-nil, zero value otherwise.

### GetMeterOk

`func (o *TieredPrice) GetMeterOk() (*string, bool)`

GetMeterOk returns a tuple with the Meter field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMeter

`func (o *TieredPrice) SetMeter(v string)`

SetMeter sets Meter field to given value.

### HasMeter

`func (o *TieredPrice) HasMeter() bool`

HasMeter returns a boolean if a field has been set.

### GetBillingScheme

`func (o *TieredPrice) GetBillingScheme() string`

GetBillingScheme returns the BillingScheme field if non-nil, zero value otherwise.

### GetBillingSchemeOk

`func (o *TieredPrice) GetBillingSchemeOk() (*string, bool)`

GetBillingSchemeOk returns a tuple with the BillingScheme field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBillingScheme

`func (o *TieredPrice) SetBillingScheme(v string)`

SetBillingScheme sets BillingScheme field to given value.


### GetTiersMode

`func (o *TieredPrice) GetTiersMode() string`

GetTiersMode returns the TiersMode field if non-nil, zero value otherwise.

### GetTiersModeOk

`func (o *TieredPrice) GetTiersModeOk() (*string, bool)`

GetTiersModeOk returns a tuple with the TiersMode field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTiersMode

`func (o *TieredPrice) SetTiersMode(v string)`

SetTiersMode sets TiersMode field to given value.


### GetTiers

`func (o *TieredPrice) GetTiers() []Tier`

GetTiers returns the Tiers field if non-nil, zero value otherwise.

### GetTiersOk

`func (o *TieredPrice) GetTiersOk() (*[]Tier, bool)`

GetTiersOk returns a tuple with the Tiers field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTiers

`func (o *TieredPrice) SetTiers(v []Tier)`

SetTiers sets Tiers field to given value.


### GetDefault

`func (o *TieredPrice) GetDefault() bool`

GetDefault returns the Default field if non-nil, zero value otherwise.

### GetDefaultOk

`func (o *TieredPrice) GetDefaultOk() (*bool, bool)`

GetDefaultOk returns a tuple with the Default field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDefault

`func (o *TieredPrice) SetDefault(v bool)`

SetDefault sets Default field to given value.

### HasDefault

`func (o *TieredPrice) HasDefault() bool`

HasDefault returns a boolean if a field has been set.

### GetUi

`func (o *TieredPrice) GetUi() PriceUI`

GetUi returns the Ui field if non-nil, zero value otherwise.

### GetUiOk

`func (o *TieredPrice) GetUiOk() (*PriceUI, bool)`

GetUiOk returns a tuple with the Ui field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUi

`func (o *TieredPrice) SetUi(v PriceUI)`

SetUi sets Ui field to given value.

### HasUi

`func (o *TieredPrice) HasUi() bool`

HasUi returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


