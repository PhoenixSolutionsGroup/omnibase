# Price

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Amount** | Pointer to **float64** |  | [optional] 
**BillingScheme** | Pointer to **string** |  | [optional] 
**Currency** | **string** |  | 
**Default** | Pointer to **bool** |  | [optional] 
**EnterpriseId** | Pointer to **string** |  | [optional] 
**EnterpriseTemplate** | Pointer to **string** |  | [optional] 
**Id** | **string** |  | 
**Interval** | Pointer to **string** |  | [optional] 
**IntervalCount** | Pointer to **int64** |  | [optional] 
**Meter** | Pointer to **string** |  | [optional] 
**Public** | Pointer to **bool** |  | [optional] 
**StripeId** | Pointer to **string** |  | [optional] 
**TaxIncludedInPrice** | Pointer to **bool** |  | [optional] 
**Tiers** | Pointer to [**[]Tier**](Tier.md) |  | [optional] 
**TiersMode** | Pointer to **string** |  | [optional] 
**Ui** | Pointer to [**PriceUI**](PriceUI.md) |  | [optional] 
**UsageType** | Pointer to **string** |  | [optional] 

## Methods

### NewPrice

`func NewPrice(currency string, id string, ) *Price`

NewPrice instantiates a new Price object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewPriceWithDefaults

`func NewPriceWithDefaults() *Price`

NewPriceWithDefaults instantiates a new Price object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAmount

`func (o *Price) GetAmount() float64`

GetAmount returns the Amount field if non-nil, zero value otherwise.

### GetAmountOk

`func (o *Price) GetAmountOk() (*float64, bool)`

GetAmountOk returns a tuple with the Amount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAmount

`func (o *Price) SetAmount(v float64)`

SetAmount sets Amount field to given value.

### HasAmount

`func (o *Price) HasAmount() bool`

HasAmount returns a boolean if a field has been set.

### GetBillingScheme

`func (o *Price) GetBillingScheme() string`

GetBillingScheme returns the BillingScheme field if non-nil, zero value otherwise.

### GetBillingSchemeOk

`func (o *Price) GetBillingSchemeOk() (*string, bool)`

GetBillingSchemeOk returns a tuple with the BillingScheme field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBillingScheme

`func (o *Price) SetBillingScheme(v string)`

SetBillingScheme sets BillingScheme field to given value.

### HasBillingScheme

`func (o *Price) HasBillingScheme() bool`

HasBillingScheme returns a boolean if a field has been set.

### GetCurrency

`func (o *Price) GetCurrency() string`

GetCurrency returns the Currency field if non-nil, zero value otherwise.

### GetCurrencyOk

`func (o *Price) GetCurrencyOk() (*string, bool)`

GetCurrencyOk returns a tuple with the Currency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrency

`func (o *Price) SetCurrency(v string)`

SetCurrency sets Currency field to given value.


### GetDefault

`func (o *Price) GetDefault() bool`

GetDefault returns the Default field if non-nil, zero value otherwise.

### GetDefaultOk

`func (o *Price) GetDefaultOk() (*bool, bool)`

GetDefaultOk returns a tuple with the Default field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDefault

`func (o *Price) SetDefault(v bool)`

SetDefault sets Default field to given value.

### HasDefault

`func (o *Price) HasDefault() bool`

HasDefault returns a boolean if a field has been set.

### GetEnterpriseId

`func (o *Price) GetEnterpriseId() string`

GetEnterpriseId returns the EnterpriseId field if non-nil, zero value otherwise.

### GetEnterpriseIdOk

`func (o *Price) GetEnterpriseIdOk() (*string, bool)`

GetEnterpriseIdOk returns a tuple with the EnterpriseId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnterpriseId

`func (o *Price) SetEnterpriseId(v string)`

SetEnterpriseId sets EnterpriseId field to given value.

### HasEnterpriseId

`func (o *Price) HasEnterpriseId() bool`

HasEnterpriseId returns a boolean if a field has been set.

### GetEnterpriseTemplate

`func (o *Price) GetEnterpriseTemplate() string`

GetEnterpriseTemplate returns the EnterpriseTemplate field if non-nil, zero value otherwise.

### GetEnterpriseTemplateOk

`func (o *Price) GetEnterpriseTemplateOk() (*string, bool)`

GetEnterpriseTemplateOk returns a tuple with the EnterpriseTemplate field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnterpriseTemplate

`func (o *Price) SetEnterpriseTemplate(v string)`

SetEnterpriseTemplate sets EnterpriseTemplate field to given value.

### HasEnterpriseTemplate

`func (o *Price) HasEnterpriseTemplate() bool`

HasEnterpriseTemplate returns a boolean if a field has been set.

### GetId

`func (o *Price) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *Price) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *Price) SetId(v string)`

SetId sets Id field to given value.


### GetInterval

`func (o *Price) GetInterval() string`

GetInterval returns the Interval field if non-nil, zero value otherwise.

### GetIntervalOk

`func (o *Price) GetIntervalOk() (*string, bool)`

GetIntervalOk returns a tuple with the Interval field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInterval

`func (o *Price) SetInterval(v string)`

SetInterval sets Interval field to given value.

### HasInterval

`func (o *Price) HasInterval() bool`

HasInterval returns a boolean if a field has been set.

### GetIntervalCount

`func (o *Price) GetIntervalCount() int64`

GetIntervalCount returns the IntervalCount field if non-nil, zero value otherwise.

### GetIntervalCountOk

`func (o *Price) GetIntervalCountOk() (*int64, bool)`

GetIntervalCountOk returns a tuple with the IntervalCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIntervalCount

`func (o *Price) SetIntervalCount(v int64)`

SetIntervalCount sets IntervalCount field to given value.

### HasIntervalCount

`func (o *Price) HasIntervalCount() bool`

HasIntervalCount returns a boolean if a field has been set.

### GetMeter

`func (o *Price) GetMeter() string`

GetMeter returns the Meter field if non-nil, zero value otherwise.

### GetMeterOk

`func (o *Price) GetMeterOk() (*string, bool)`

GetMeterOk returns a tuple with the Meter field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMeter

`func (o *Price) SetMeter(v string)`

SetMeter sets Meter field to given value.

### HasMeter

`func (o *Price) HasMeter() bool`

HasMeter returns a boolean if a field has been set.

### GetPublic

`func (o *Price) GetPublic() bool`

GetPublic returns the Public field if non-nil, zero value otherwise.

### GetPublicOk

`func (o *Price) GetPublicOk() (*bool, bool)`

GetPublicOk returns a tuple with the Public field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPublic

`func (o *Price) SetPublic(v bool)`

SetPublic sets Public field to given value.

### HasPublic

`func (o *Price) HasPublic() bool`

HasPublic returns a boolean if a field has been set.

### GetStripeId

`func (o *Price) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *Price) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *Price) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *Price) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.

### GetTaxIncludedInPrice

`func (o *Price) GetTaxIncludedInPrice() bool`

GetTaxIncludedInPrice returns the TaxIncludedInPrice field if non-nil, zero value otherwise.

### GetTaxIncludedInPriceOk

`func (o *Price) GetTaxIncludedInPriceOk() (*bool, bool)`

GetTaxIncludedInPriceOk returns a tuple with the TaxIncludedInPrice field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTaxIncludedInPrice

`func (o *Price) SetTaxIncludedInPrice(v bool)`

SetTaxIncludedInPrice sets TaxIncludedInPrice field to given value.

### HasTaxIncludedInPrice

`func (o *Price) HasTaxIncludedInPrice() bool`

HasTaxIncludedInPrice returns a boolean if a field has been set.

### GetTiers

`func (o *Price) GetTiers() []Tier`

GetTiers returns the Tiers field if non-nil, zero value otherwise.

### GetTiersOk

`func (o *Price) GetTiersOk() (*[]Tier, bool)`

GetTiersOk returns a tuple with the Tiers field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTiers

`func (o *Price) SetTiers(v []Tier)`

SetTiers sets Tiers field to given value.

### HasTiers

`func (o *Price) HasTiers() bool`

HasTiers returns a boolean if a field has been set.

### SetTiersNil

`func (o *Price) SetTiersNil(b bool)`

 SetTiersNil sets the value for Tiers to be an explicit nil

### UnsetTiers
`func (o *Price) UnsetTiers()`

UnsetTiers ensures that no value is present for Tiers, not even an explicit nil
### GetTiersMode

`func (o *Price) GetTiersMode() string`

GetTiersMode returns the TiersMode field if non-nil, zero value otherwise.

### GetTiersModeOk

`func (o *Price) GetTiersModeOk() (*string, bool)`

GetTiersModeOk returns a tuple with the TiersMode field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTiersMode

`func (o *Price) SetTiersMode(v string)`

SetTiersMode sets TiersMode field to given value.

### HasTiersMode

`func (o *Price) HasTiersMode() bool`

HasTiersMode returns a boolean if a field has been set.

### GetUi

`func (o *Price) GetUi() PriceUI`

GetUi returns the Ui field if non-nil, zero value otherwise.

### GetUiOk

`func (o *Price) GetUiOk() (*PriceUI, bool)`

GetUiOk returns a tuple with the Ui field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUi

`func (o *Price) SetUi(v PriceUI)`

SetUi sets Ui field to given value.

### HasUi

`func (o *Price) HasUi() bool`

HasUi returns a boolean if a field has been set.

### GetUsageType

`func (o *Price) GetUsageType() string`

GetUsageType returns the UsageType field if non-nil, zero value otherwise.

### GetUsageTypeOk

`func (o *Price) GetUsageTypeOk() (*string, bool)`

GetUsageTypeOk returns a tuple with the UsageType field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUsageType

`func (o *Price) SetUsageType(v string)`

SetUsageType sets UsageType field to given value.

### HasUsageType

`func (o *Price) HasUsageType() bool`

HasUsageType returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


