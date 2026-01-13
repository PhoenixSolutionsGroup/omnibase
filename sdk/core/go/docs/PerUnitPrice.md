# PerUnitPrice

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** | Price identifier (config ID) | 
**StripeId** | Pointer to **string** | Original Stripe ID for migration support (optional, used to link existing Stripe prices) | [optional] 
**Public** | Pointer to **bool** | Whether price is visible in public API (null/true &#x3D; public, false &#x3D; enterprise only) | [optional] 
**TaxIncludedInPrice** | Pointer to **bool** | Whether tax is included in the price (null/false &#x3D; exclusive) | [optional] 
**Amount** | **float64** | Price amount (supports decimals for sub-cent hourly pricing) | 
**Currency** | [**CurrencyCode**](CurrencyCode.md) |  | 
**Interval** | Pointer to [**BillingInterval**](BillingInterval.md) | Billing interval for recurring prices (required when usage_type is metered) | [optional] 
**IntervalCount** | Pointer to **int32** | Number of intervals between billings (default 1) | [optional] 
**UsageType** | Pointer to [**UsageType**](UsageType.md) | Usage type for recurring prices (when set to metered, interval and meter are required) | [optional] 
**Meter** | Pointer to **string** | Meter ID for metered pricing (required when usage_type is metered, must reference a meter defined in the meters array) | [optional] 
**BillingScheme** | Pointer to [**PerUnitBillingScheme**](PerUnitBillingScheme.md) |  | [optional] [default to PER_UNIT]
**Default** | Pointer to **bool** | Mark as default price for the product | [optional] 
**EnterpriseTemplate** | Pointer to **string** | Enterprise template group for shared pricing tiers | [optional] 
**EnterpriseId** | Pointer to **string** | Enterprise pricing group ID for tenant-specific pricing | [optional] 
**Ui** | Pointer to [**PriceUI**](PriceUI.md) |  | [optional] 

## Methods

### NewPerUnitPrice

`func NewPerUnitPrice(id string, amount float64, currency CurrencyCode, ) *PerUnitPrice`

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


### GetStripeId

`func (o *PerUnitPrice) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *PerUnitPrice) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *PerUnitPrice) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *PerUnitPrice) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.

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

`func (o *PerUnitPrice) GetAmount() float64`

GetAmount returns the Amount field if non-nil, zero value otherwise.

### GetAmountOk

`func (o *PerUnitPrice) GetAmountOk() (*float64, bool)`

GetAmountOk returns a tuple with the Amount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAmount

`func (o *PerUnitPrice) SetAmount(v float64)`

SetAmount sets Amount field to given value.


### GetCurrency

`func (o *PerUnitPrice) GetCurrency() CurrencyCode`

GetCurrency returns the Currency field if non-nil, zero value otherwise.

### GetCurrencyOk

`func (o *PerUnitPrice) GetCurrencyOk() (*CurrencyCode, bool)`

GetCurrencyOk returns a tuple with the Currency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrency

`func (o *PerUnitPrice) SetCurrency(v CurrencyCode)`

SetCurrency sets Currency field to given value.


### GetInterval

`func (o *PerUnitPrice) GetInterval() BillingInterval`

GetInterval returns the Interval field if non-nil, zero value otherwise.

### GetIntervalOk

`func (o *PerUnitPrice) GetIntervalOk() (*BillingInterval, bool)`

GetIntervalOk returns a tuple with the Interval field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInterval

`func (o *PerUnitPrice) SetInterval(v BillingInterval)`

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

`func (o *PerUnitPrice) GetUsageType() UsageType`

GetUsageType returns the UsageType field if non-nil, zero value otherwise.

### GetUsageTypeOk

`func (o *PerUnitPrice) GetUsageTypeOk() (*UsageType, bool)`

GetUsageTypeOk returns a tuple with the UsageType field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUsageType

`func (o *PerUnitPrice) SetUsageType(v UsageType)`

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

`func (o *PerUnitPrice) GetBillingScheme() PerUnitBillingScheme`

GetBillingScheme returns the BillingScheme field if non-nil, zero value otherwise.

### GetBillingSchemeOk

`func (o *PerUnitPrice) GetBillingSchemeOk() (*PerUnitBillingScheme, bool)`

GetBillingSchemeOk returns a tuple with the BillingScheme field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBillingScheme

`func (o *PerUnitPrice) SetBillingScheme(v PerUnitBillingScheme)`

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

### GetEnterpriseTemplate

`func (o *PerUnitPrice) GetEnterpriseTemplate() string`

GetEnterpriseTemplate returns the EnterpriseTemplate field if non-nil, zero value otherwise.

### GetEnterpriseTemplateOk

`func (o *PerUnitPrice) GetEnterpriseTemplateOk() (*string, bool)`

GetEnterpriseTemplateOk returns a tuple with the EnterpriseTemplate field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnterpriseTemplate

`func (o *PerUnitPrice) SetEnterpriseTemplate(v string)`

SetEnterpriseTemplate sets EnterpriseTemplate field to given value.

### HasEnterpriseTemplate

`func (o *PerUnitPrice) HasEnterpriseTemplate() bool`

HasEnterpriseTemplate returns a boolean if a field has been set.

### GetEnterpriseId

`func (o *PerUnitPrice) GetEnterpriseId() string`

GetEnterpriseId returns the EnterpriseId field if non-nil, zero value otherwise.

### GetEnterpriseIdOk

`func (o *PerUnitPrice) GetEnterpriseIdOk() (*string, bool)`

GetEnterpriseIdOk returns a tuple with the EnterpriseId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnterpriseId

`func (o *PerUnitPrice) SetEnterpriseId(v string)`

SetEnterpriseId sets EnterpriseId field to given value.

### HasEnterpriseId

`func (o *PerUnitPrice) HasEnterpriseId() bool`

HasEnterpriseId returns a boolean if a field has been set.

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


