# Tier

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**UpTo** | Pointer to [**TierUpTo**](TierUpTo.md) |  | [optional] 
**FlatAmount** | Pointer to **int64** | Flat fee for this tier | [optional] 
**UnitAmount** | Pointer to **int64** | Per-unit price for this tier | [optional] 

## Methods

### NewTier

`func NewTier() *Tier`

NewTier instantiates a new Tier object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTierWithDefaults

`func NewTierWithDefaults() *Tier`

NewTierWithDefaults instantiates a new Tier object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetUpTo

`func (o *Tier) GetUpTo() TierUpTo`

GetUpTo returns the UpTo field if non-nil, zero value otherwise.

### GetUpToOk

`func (o *Tier) GetUpToOk() (*TierUpTo, bool)`

GetUpToOk returns a tuple with the UpTo field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpTo

`func (o *Tier) SetUpTo(v TierUpTo)`

SetUpTo sets UpTo field to given value.

### HasUpTo

`func (o *Tier) HasUpTo() bool`

HasUpTo returns a boolean if a field has been set.

### GetFlatAmount

`func (o *Tier) GetFlatAmount() int64`

GetFlatAmount returns the FlatAmount field if non-nil, zero value otherwise.

### GetFlatAmountOk

`func (o *Tier) GetFlatAmountOk() (*int64, bool)`

GetFlatAmountOk returns a tuple with the FlatAmount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFlatAmount

`func (o *Tier) SetFlatAmount(v int64)`

SetFlatAmount sets FlatAmount field to given value.

### HasFlatAmount

`func (o *Tier) HasFlatAmount() bool`

HasFlatAmount returns a boolean if a field has been set.

### GetUnitAmount

`func (o *Tier) GetUnitAmount() int64`

GetUnitAmount returns the UnitAmount field if non-nil, zero value otherwise.

### GetUnitAmountOk

`func (o *Tier) GetUnitAmountOk() (*int64, bool)`

GetUnitAmountOk returns a tuple with the UnitAmount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUnitAmount

`func (o *Tier) SetUnitAmount(v int64)`

SetUnitAmount sets UnitAmount field to given value.

### HasUnitAmount

`func (o *Tier) HasUnitAmount() bool`

HasUnitAmount returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


