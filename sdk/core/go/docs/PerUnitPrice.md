# PerUnitPrice

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** | Price identifier (config ID) | 
**Public** | Pointer to **bool** | Whether price is visible in public API (null/true &#x3D; public, false &#x3D; enterprise only) | [optional] 
**TaxIncludedInPrice** | Pointer to **bool** | Whether tax is included in the price (null/false &#x3D; exclusive) | [optional] 
**Amount** | **int64** | Price amount in smallest currency unit (e.g., cents) - minimum $0.01 per Stripe requirements | 
**Currency** | **string** | Three-letter ISO currency code (lowercase) | 
**Interval** | Pointer to **string** | Billing interval for recurring prices (required when usage_type is metered) | [optional] 
**IntervalCount** | Pointer to **int32** | Number of intervals between billings (default 1) | [optional] 
**UsageType** | Pointer to **string** | Usage type for recurring prices (when set to metered, interval and meter are required) | [optional] 
**Meter** | Pointer to **string** | Meter ID for metered pricing (required when usage_type is metered, must reference a meter defined in the meters array) | [optional] 
**BillingScheme** | Pointer to **string** | Billing scheme type | [optional] [default to "per_unit"]
**Default** | Pointer to **bool** | Mark as default price for the product | [optional] 
**Ui** | Pointer to [**PriceUI**](PriceUI.md) |  | [optional] 

## Methods

### NewPerUnitPrice

`func NewPerUnitPrice(id string, amount int64, currency string, ) *PerUnitPrice`

NewPerUnitPrice instantiates a new PerUnitPrice object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewPerUnitPriceWithDefaults

`func NewPerUnitPriceWithDefaults() *PerUnitPrice`

NewPerUnitPriceWithDefaults instantiates a new PerUnitPrice object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *PerUnitPrice) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *PerUnitPrice) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *PerUnitPrice) SetId(v string)`

SetId sets Id field to given value.


### GetPublic

`func (o *PerUnitPrice) GetPublic() bool`

GetPublic returns the Public field if non-nil, zero value otherwise.

### GetPublicOk

`func (o *PerUnitPrice) GetPublicOk() (*bool, bool)`

GetPublicOk returns a tuple with the Public field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPublic

`func (o *PerUnitPrice) SetPublic(v bool)`

SetPublic sets Public field to given value.

### HasPublic

`func (o *PerUnitPrice) HasPublic() bool`

HasPublic returns a boolean if a field has been set.

### GetTaxIncludedInPrice

`func (o *PerUnitPrice) GetTaxIncludedInPrice() bool`

GetTaxIncludedInPrice returns the TaxIncludedInPrice field if non-nil, zero value otherwise.

### GetTaxIncludedInPriceOk

`func (o *PerUnitPrice) GetTaxIncludedInPriceOk() (*bool, bool)`

GetTaxIncludedInPriceOk returns a tuple with the TaxIncludedInPrice field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTaxIncludedInPrice

`func (o *PerUnitPrice) SetTaxIncludedInPrice(v bool)`

SetTaxIncludedInPrice sets TaxIncludedInPrice field to given value.

### HasTaxIncludedInPrice

`func (o *PerUnitPrice) HasTaxIncludedInPrice() bool`

HasTaxIncludedInPrice returns a boolean if a field has been set.

### GetAmount

`func (o *PerUnitPrice) GetAmount() int64`

GetAmount returns the Amount field if non-nil, zero value otherwise.

### GetAmountOk

`func (o *PerUnitPrice) GetAmountOk() (*int64, bool)`

GetAmountOk returns a tuple with the Amount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAmount

`func (o *PerUnitPrice) SetAmount(v int64)`

SetAmount sets Amount field to given value.


### GetCurrency

`func (o *PerUnitPrice) GetCurrency() string`

GetCurrency returns the Currency field if non-nil, zero value otherwise.

### GetCurrencyOk

`func (o *PerUnitPrice) GetCurrencyOk() (*string, bool)`

GetCurrencyOk returns a tuple with the Currency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrency

`func (o *PerUnitPrice) SetCurrency(v string)`

SetCurrency sets Currency field to given value.


### GetInterval

`func (o *PerUnitPrice) GetInterval() string`

GetInterval returns the Interval field if non-nil, zero value otherwise.

### GetIntervalOk

`func (o *PerUnitPrice) GetIntervalOk() (*string, bool)`

GetIntervalOk returns a tuple with the Interval field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInterval

`func (o *PerUnitPrice) SetInterval(v string)`

SetInterval sets Interval field to given value.

### HasInterval

`func (o *PerUnitPrice) HasInterval() bool`

HasInterval returns a boolean if a field has been set.

### GetIntervalCount

`func (o *PerUnitPrice) GetIntervalCount() int32`

GetIntervalCount returns the IntervalCount field if non-nil, zero value otherwise.

### GetIntervalCountOk

`func (o *PerUnitPrice) GetIntervalCountOk() (*int32, bool)`

GetIntervalCountOk returns a tuple with the IntervalCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIntervalCount

`func (o *PerUnitPrice) SetIntervalCount(v int32)`

SetIntervalCount sets IntervalCount field to given value.

### HasIntervalCount

`func (o *PerUnitPrice) HasIntervalCount() bool`

HasIntervalCount returns a boolean if a field has been set.

### GetUsageType

`func (o *PerUnitPrice) GetUsageType() string`

GetUsageType returns the UsageType field if non-nil, zero value otherwise.

### GetUsageTypeOk

`func (o *PerUnitPrice) GetUsageTypeOk() (*string, bool)`

GetUsageTypeOk returns a tuple with the UsageType field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUsageType

`func (o *PerUnitPrice) SetUsageType(v string)`

SetUsageType sets UsageType field to given value.

### HasUsageType

`func (o *PerUnitPrice) HasUsageType() bool`

HasUsageType returns a boolean if a field has been set.

### GetMeter

`func (o *PerUnitPrice) GetMeter() string`

GetMeter returns the Meter field if non-nil, zero value otherwise.

### GetMeterOk

`func (o *PerUnitPrice) GetMeterOk() (*string, bool)`

GetMeterOk returns a tuple with the Meter field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMeter

`func (o *PerUnitPrice) SetMeter(v string)`

SetMeter sets Meter field to given value.

### HasMeter

`func (o *PerUnitPrice) HasMeter() bool`

HasMeter returns a boolean if a field has been set.

### GetBillingScheme

`func (o *PerUnitPrice) GetBillingScheme() string`

GetBillingScheme returns the BillingScheme field if non-nil, zero value otherwise.

### GetBillingSchemeOk

`func (o *PerUnitPrice) GetBillingSchemeOk() (*string, bool)`

GetBillingSchemeOk returns a tuple with the BillingScheme field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBillingScheme

`func (o *PerUnitPrice) SetBillingScheme(v string)`

SetBillingScheme sets BillingScheme field to given value.

### HasBillingScheme

`func (o *PerUnitPrice) HasBillingScheme() bool`

HasBillingScheme returns a boolean if a field has been set.

### GetDefault

`func (o *PerUnitPrice) GetDefault() bool`

GetDefault returns the Default field if non-nil, zero value otherwise.

### GetDefaultOk

`func (o *PerUnitPrice) GetDefaultOk() (*bool, bool)`

GetDefaultOk returns a tuple with the Default field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDefault

`func (o *PerUnitPrice) SetDefault(v bool)`

SetDefault sets Default field to given value.

### HasDefault

`func (o *PerUnitPrice) HasDefault() bool`

HasDefault returns a boolean if a field has been set.

### GetUi

`func (o *PerUnitPrice) GetUi() PriceUI`

GetUi returns the Ui field if non-nil, zero value otherwise.

### GetUiOk

`func (o *PerUnitPrice) GetUiOk() (*PriceUI, bool)`

GetUiOk returns a tuple with the Ui field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUi

`func (o *PerUnitPrice) SetUi(v PriceUI)`

SetUi sets Ui field to given value.

### HasUi

`func (o *PerUnitPrice) HasUi() bool`

HasUi returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


