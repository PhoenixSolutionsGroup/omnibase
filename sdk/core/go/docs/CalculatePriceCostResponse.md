# CalculatePriceCostResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**PriceId** | **string** | The config price ID | 
**Quantity** | **int64** | The quantity used for calculation | 
**CostCents** | **int64** | The calculated cost in smallest currency unit (e.g., cents) | 
**EffectiveUnitCostCents** | **float64** | The effective unit cost (cost_cents / quantity), 0 if quantity is 0 | 
**Currency** | **string** | The currency code | 
**BillingScheme** | **string** | The billing scheme used (per_unit or tiered) | 
**TiersMode** | Pointer to **string** | The tiers mode if tiered pricing (graduated or volume), empty for per_unit | [optional] 

## Methods

### NewCalculatePriceCostResponse

`func NewCalculatePriceCostResponse(priceId string, quantity int64, costCents int64, effectiveUnitCostCents float64, currency string, billingScheme string, ) *CalculatePriceCostResponse`

NewCalculatePriceCostResponse instantiates a new CalculatePriceCostResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCalculatePriceCostResponseWithDefaults

`func NewCalculatePriceCostResponseWithDefaults() *CalculatePriceCostResponse`

NewCalculatePriceCostResponseWithDefaults instantiates a new CalculatePriceCostResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPriceId

`func (o *CalculatePriceCostResponse) GetPriceId() string`

GetPriceId returns the PriceId field if non-nil, zero value otherwise.

### GetPriceIdOk

`func (o *CalculatePriceCostResponse) GetPriceIdOk() (*string, bool)`

GetPriceIdOk returns a tuple with the PriceId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPriceId

`func (o *CalculatePriceCostResponse) SetPriceId(v string)`

SetPriceId sets PriceId field to given value.


### GetQuantity

`func (o *CalculatePriceCostResponse) GetQuantity() int64`

GetQuantity returns the Quantity field if non-nil, zero value otherwise.

### GetQuantityOk

`func (o *CalculatePriceCostResponse) GetQuantityOk() (*int64, bool)`

GetQuantityOk returns a tuple with the Quantity field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetQuantity

`func (o *CalculatePriceCostResponse) SetQuantity(v int64)`

SetQuantity sets Quantity field to given value.


### GetCostCents

`func (o *CalculatePriceCostResponse) GetCostCents() int64`

GetCostCents returns the CostCents field if non-nil, zero value otherwise.

### GetCostCentsOk

`func (o *CalculatePriceCostResponse) GetCostCentsOk() (*int64, bool)`

GetCostCentsOk returns a tuple with the CostCents field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCostCents

`func (o *CalculatePriceCostResponse) SetCostCents(v int64)`

SetCostCents sets CostCents field to given value.


### GetEffectiveUnitCostCents

`func (o *CalculatePriceCostResponse) GetEffectiveUnitCostCents() float64`

GetEffectiveUnitCostCents returns the EffectiveUnitCostCents field if non-nil, zero value otherwise.

### GetEffectiveUnitCostCentsOk

`func (o *CalculatePriceCostResponse) GetEffectiveUnitCostCentsOk() (*float64, bool)`

GetEffectiveUnitCostCentsOk returns a tuple with the EffectiveUnitCostCents field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEffectiveUnitCostCents

`func (o *CalculatePriceCostResponse) SetEffectiveUnitCostCents(v float64)`

SetEffectiveUnitCostCents sets EffectiveUnitCostCents field to given value.


### GetCurrency

`func (o *CalculatePriceCostResponse) GetCurrency() string`

GetCurrency returns the Currency field if non-nil, zero value otherwise.

### GetCurrencyOk

`func (o *CalculatePriceCostResponse) GetCurrencyOk() (*string, bool)`

GetCurrencyOk returns a tuple with the Currency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrency

`func (o *CalculatePriceCostResponse) SetCurrency(v string)`

SetCurrency sets Currency field to given value.


### GetBillingScheme

`func (o *CalculatePriceCostResponse) GetBillingScheme() string`

GetBillingScheme returns the BillingScheme field if non-nil, zero value otherwise.

### GetBillingSchemeOk

`func (o *CalculatePriceCostResponse) GetBillingSchemeOk() (*string, bool)`

GetBillingSchemeOk returns a tuple with the BillingScheme field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBillingScheme

`func (o *CalculatePriceCostResponse) SetBillingScheme(v string)`

SetBillingScheme sets BillingScheme field to given value.


### GetTiersMode

`func (o *CalculatePriceCostResponse) GetTiersMode() string`

GetTiersMode returns the TiersMode field if non-nil, zero value otherwise.

### GetTiersModeOk

`func (o *CalculatePriceCostResponse) GetTiersModeOk() (*string, bool)`

GetTiersModeOk returns a tuple with the TiersMode field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTiersMode

`func (o *CalculatePriceCostResponse) SetTiersMode(v string)`

SetTiersMode sets TiersMode field to given value.

### HasTiersMode

`func (o *CalculatePriceCostResponse) HasTiersMode() bool`

HasTiersMode returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


