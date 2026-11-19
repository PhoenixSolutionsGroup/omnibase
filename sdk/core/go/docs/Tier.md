# Tier

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**FlatAmount** | Pointer to **int64** |  | [optional] 
**UnitAmount** | Pointer to **int64** |  | [optional] 
**UpTo** | **interface{}** |  | 

## Methods

### NewTier

`func NewTier(upTo interface{}, ) *Tier`

NewTier instantiates a new Tier object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTierWithDefaults

`func NewTierWithDefaults() *Tier`

NewTierWithDefaults instantiates a new Tier object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

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

### GetUpTo

`func (o *Tier) GetUpTo() interface{}`

GetUpTo returns the UpTo field if non-nil, zero value otherwise.

### GetUpToOk

`func (o *Tier) GetUpToOk() (*interface{}, bool)`

GetUpToOk returns a tuple with the UpTo field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpTo

`func (o *Tier) SetUpTo(v interface{})`

SetUpTo sets UpTo field to given value.


### SetUpToNil

`func (o *Tier) SetUpToNil(b bool)`

 SetUpToNil sets the value for UpTo to be an explicit nil

### UnsetUpTo
`func (o *Tier) UnsetUpTo()`

UnsetUpTo ensures that no value is present for UpTo, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


