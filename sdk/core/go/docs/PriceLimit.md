# PriceLimit

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Text** | **string** | Limit description | 
**Value** | Pointer to **float64** | Numeric limit value | [optional] 
**Unit** | Pointer to **string** | Unit of measurement | [optional] 

## Methods

### NewPriceLimit

`func NewPriceLimit(text string, ) *PriceLimit`

NewPriceLimit instantiates a new PriceLimit object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewPriceLimitWithDefaults

`func NewPriceLimitWithDefaults() *PriceLimit`

NewPriceLimitWithDefaults instantiates a new PriceLimit object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetText

`func (o *PriceLimit) GetText() string`

GetText returns the Text field if non-nil, zero value otherwise.

### GetTextOk

`func (o *PriceLimit) GetTextOk() (*string, bool)`

GetTextOk returns a tuple with the Text field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetText

`func (o *PriceLimit) SetText(v string)`

SetText sets Text field to given value.


### GetValue

`func (o *PriceLimit) GetValue() float64`

GetValue returns the Value field if non-nil, zero value otherwise.

### GetValueOk

`func (o *PriceLimit) GetValueOk() (*float64, bool)`

GetValueOk returns a tuple with the Value field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetValue

`func (o *PriceLimit) SetValue(v float64)`

SetValue sets Value field to given value.

### HasValue

`func (o *PriceLimit) HasValue() bool`

HasValue returns a boolean if a field has been set.

### GetUnit

`func (o *PriceLimit) GetUnit() string`

GetUnit returns the Unit field if non-nil, zero value otherwise.

### GetUnitOk

`func (o *PriceLimit) GetUnitOk() (*string, bool)`

GetUnitOk returns a tuple with the Unit field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUnit

`func (o *PriceLimit) SetUnit(v string)`

SetUnit sets Unit field to given value.

### HasUnit

`func (o *PriceLimit) HasUnit() bool`

HasUnit returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


