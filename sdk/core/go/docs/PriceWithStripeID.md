# PriceWithStripeID

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

### NewPriceWithStripeID

`func NewPriceWithStripeID(currency string, id string, ) *PriceWithStripeID`

NewPriceWithStripeID instantiates a new PriceWithStripeID object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewPriceWithStripeIDWithDefaults

`func NewPriceWithStripeIDWithDefaults() *PriceWithStripeID`

NewPriceWithStripeIDWithDefaults instantiates a new PriceWithStripeID object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAmount

`func (o *PriceWithStripeID) GetAmount() float64`

GetAmount returns the Amount field if non-nil, zero value otherwise.

### GetAmountOk

`func (o *PriceWithStripeID) GetAmountOk() (*float64, bool)`

GetAmountOk returns a tuple with the Amount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAmount

`func (o *PriceWithStripeID) SetAmount(v float64)`

SetAmount sets Amount field to given value.

### HasAmount

`func (o *PriceWithStripeID) HasAmount() bool`

HasAmount returns a boolean if a field has been set.

### GetBillingScheme

`func (o *PriceWithStripeID) GetBillingScheme() string`

GetBillingScheme returns the BillingScheme field if non-nil, zero value otherwise.

### GetBillingSchemeOk

`func (o *PriceWithStripeID) GetBillingSchemeOk() (*string, bool)`

GetBillingSchemeOk returns a tuple with the BillingScheme field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBillingScheme

`func (o *PriceWithStripeID) SetBillingScheme(v string)`

SetBillingScheme sets BillingScheme field to given value.

### HasBillingScheme

`func (o *PriceWithStripeID) HasBillingScheme() bool`

HasBillingScheme returns a boolean if a field has been set.

### GetCurrency

`func (o *PriceWithStripeID) GetCurrency() string`

GetCurrency returns the Currency field if non-nil, zero value otherwise.

### GetCurrencyOk

`func (o *PriceWithStripeID) GetCurrencyOk() (*string, bool)`

GetCurrencyOk returns a tuple with the Currency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrency

`func (o *PriceWithStripeID) SetCurrency(v string)`

SetCurrency sets Currency field to given value.


### GetDefault

`func (o *PriceWithStripeID) GetDefault() bool`

GetDefault returns the Default field if non-nil, zero value otherwise.

### GetDefaultOk

`func (o *PriceWithStripeID) GetDefaultOk() (*bool, bool)`

GetDefaultOk returns a tuple with the Default field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDefault

`func (o *PriceWithStripeID) SetDefault(v bool)`

SetDefault sets Default field to given value.

### HasDefault

`func (o *PriceWithStripeID) HasDefault() bool`

HasDefault returns a boolean if a field has been set.

### GetEnterpriseId

`func (o *PriceWithStripeID) GetEnterpriseId() string`

GetEnterpriseId returns the EnterpriseId field if non-nil, zero value otherwise.

### GetEnterpriseIdOk

`func (o *PriceWithStripeID) GetEnterpriseIdOk() (*string, bool)`

GetEnterpriseIdOk returns a tuple with the EnterpriseId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnterpriseId

`func (o *PriceWithStripeID) SetEnterpriseId(v string)`

SetEnterpriseId sets EnterpriseId field to given value.

### HasEnterpriseId

`func (o *PriceWithStripeID) HasEnterpriseId() bool`

HasEnterpriseId returns a boolean if a field has been set.

### GetEnterpriseTemplate

`func (o *PriceWithStripeID) GetEnterpriseTemplate() string`

GetEnterpriseTemplate returns the EnterpriseTemplate field if non-nil, zero value otherwise.

### GetEnterpriseTemplateOk

`func (o *PriceWithStripeID) GetEnterpriseTemplateOk() (*string, bool)`

GetEnterpriseTemplateOk returns a tuple with the EnterpriseTemplate field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnterpriseTemplate

`func (o *PriceWithStripeID) SetEnterpriseTemplate(v string)`

SetEnterpriseTemplate sets EnterpriseTemplate field to given value.

### HasEnterpriseTemplate

`func (o *PriceWithStripeID) HasEnterpriseTemplate() bool`

HasEnterpriseTemplate returns a boolean if a field has been set.

### GetId

`func (o *PriceWithStripeID) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *PriceWithStripeID) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *PriceWithStripeID) SetId(v string)`

SetId sets Id field to given value.


### GetInterval

`func (o *PriceWithStripeID) GetInterval() string`

GetInterval returns the Interval field if non-nil, zero value otherwise.

### GetIntervalOk

`func (o *PriceWithStripeID) GetIntervalOk() (*string, bool)`

GetIntervalOk returns a tuple with the Interval field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInterval

`func (o *PriceWithStripeID) SetInterval(v string)`

SetInterval sets Interval field to given value.

### HasInterval

`func (o *PriceWithStripeID) HasInterval() bool`

HasInterval returns a boolean if a field has been set.

### GetIntervalCount

`func (o *PriceWithStripeID) GetIntervalCount() int64`

GetIntervalCount returns the IntervalCount field if non-nil, zero value otherwise.

### GetIntervalCountOk

`func (o *PriceWithStripeID) GetIntervalCountOk() (*int64, bool)`

GetIntervalCountOk returns a tuple with the IntervalCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIntervalCount

`func (o *PriceWithStripeID) SetIntervalCount(v int64)`

SetIntervalCount sets IntervalCount field to given value.

### HasIntervalCount

`func (o *PriceWithStripeID) HasIntervalCount() bool`

HasIntervalCount returns a boolean if a field has been set.

### GetMeter

`func (o *PriceWithStripeID) GetMeter() string`

GetMeter returns the Meter field if non-nil, zero value otherwise.

### GetMeterOk

`func (o *PriceWithStripeID) GetMeterOk() (*string, bool)`

GetMeterOk returns a tuple with the Meter field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMeter

`func (o *PriceWithStripeID) SetMeter(v string)`

SetMeter sets Meter field to given value.

### HasMeter

`func (o *PriceWithStripeID) HasMeter() bool`

HasMeter returns a boolean if a field has been set.

### GetPublic

`func (o *PriceWithStripeID) GetPublic() bool`

GetPublic returns the Public field if non-nil, zero value otherwise.

### GetPublicOk

`func (o *PriceWithStripeID) GetPublicOk() (*bool, bool)`

GetPublicOk returns a tuple with the Public field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPublic

`func (o *PriceWithStripeID) SetPublic(v bool)`

SetPublic sets Public field to given value.

### HasPublic

`func (o *PriceWithStripeID) HasPublic() bool`

HasPublic returns a boolean if a field has been set.

### GetStripeId

`func (o *PriceWithStripeID) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *PriceWithStripeID) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *PriceWithStripeID) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *PriceWithStripeID) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.

### GetTaxIncludedInPrice

`func (o *PriceWithStripeID) GetTaxIncludedInPrice() bool`

GetTaxIncludedInPrice returns the TaxIncludedInPrice field if non-nil, zero value otherwise.

### GetTaxIncludedInPriceOk

`func (o *PriceWithStripeID) GetTaxIncludedInPriceOk() (*bool, bool)`

GetTaxIncludedInPriceOk returns a tuple with the TaxIncludedInPrice field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTaxIncludedInPrice

`func (o *PriceWithStripeID) SetTaxIncludedInPrice(v bool)`

SetTaxIncludedInPrice sets TaxIncludedInPrice field to given value.

### HasTaxIncludedInPrice

`func (o *PriceWithStripeID) HasTaxIncludedInPrice() bool`

HasTaxIncludedInPrice returns a boolean if a field has been set.

### GetTiers

`func (o *PriceWithStripeID) GetTiers() []Tier`

GetTiers returns the Tiers field if non-nil, zero value otherwise.

### GetTiersOk

`func (o *PriceWithStripeID) GetTiersOk() (*[]Tier, bool)`

GetTiersOk returns a tuple with the Tiers field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTiers

`func (o *PriceWithStripeID) SetTiers(v []Tier)`

SetTiers sets Tiers field to given value.

### HasTiers

`func (o *PriceWithStripeID) HasTiers() bool`

HasTiers returns a boolean if a field has been set.

### SetTiersNil

`func (o *PriceWithStripeID) SetTiersNil(b bool)`

 SetTiersNil sets the value for Tiers to be an explicit nil

### UnsetTiers
`func (o *PriceWithStripeID) UnsetTiers()`

UnsetTiers ensures that no value is present for Tiers, not even an explicit nil
### GetTiersMode

`func (o *PriceWithStripeID) GetTiersMode() string`

GetTiersMode returns the TiersMode field if non-nil, zero value otherwise.

### GetTiersModeOk

`func (o *PriceWithStripeID) GetTiersModeOk() (*string, bool)`

GetTiersModeOk returns a tuple with the TiersMode field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTiersMode

`func (o *PriceWithStripeID) SetTiersMode(v string)`

SetTiersMode sets TiersMode field to given value.

### HasTiersMode

`func (o *PriceWithStripeID) HasTiersMode() bool`

HasTiersMode returns a boolean if a field has been set.

### GetUi

`func (o *PriceWithStripeID) GetUi() PriceUI`

GetUi returns the Ui field if non-nil, zero value otherwise.

### GetUiOk

`func (o *PriceWithStripeID) GetUiOk() (*PriceUI, bool)`

GetUiOk returns a tuple with the Ui field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUi

`func (o *PriceWithStripeID) SetUi(v PriceUI)`

SetUi sets Ui field to given value.

### HasUi

`func (o *PriceWithStripeID) HasUi() bool`

HasUi returns a boolean if a field has been set.

### GetUsageType

`func (o *PriceWithStripeID) GetUsageType() string`

GetUsageType returns the UsageType field if non-nil, zero value otherwise.

### GetUsageTypeOk

`func (o *PriceWithStripeID) GetUsageTypeOk() (*string, bool)`

GetUsageTypeOk returns a tuple with the UsageType field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUsageType

`func (o *PriceWithStripeID) SetUsageType(v string)`

SetUsageType sets UsageType field to given value.

### HasUsageType

`func (o *PriceWithStripeID) HasUsageType() bool`

HasUsageType returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


