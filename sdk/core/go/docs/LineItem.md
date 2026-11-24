# LineItem

## Properties

| Name         | Type                 | Description | Notes                     |
| ------------ | -------------------- | ----------- | ------------------------- |
| **PriceId**  | **string**           |             |
| **Quantity** | Pointer to **int64** |             | [optional] [default to 1] |

## Methods

### NewLineItem

`func NewLineItem(priceId string, ) *LineItem`

NewLineItem instantiates a new LineItem object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewLineItemWithDefaults

`func NewLineItemWithDefaults() *LineItem`

NewLineItemWithDefaults instantiates a new LineItem object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPriceId

`func (o *LineItem) GetPriceId() string`

GetPriceId returns the PriceId field if non-nil, zero value otherwise.

### GetPriceIdOk

`func (o *LineItem) GetPriceIdOk() (*string, bool)`

GetPriceIdOk returns a tuple with the PriceId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPriceId

`func (o *LineItem) SetPriceId(v string)`

SetPriceId sets PriceId field to given value.

### GetQuantity

`func (o *LineItem) GetQuantity() int64`

GetQuantity returns the Quantity field if non-nil, zero value otherwise.

### GetQuantityOk

`func (o *LineItem) GetQuantityOk() (*int64, bool)`

GetQuantityOk returns a tuple with the Quantity field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetQuantity

`func (o *LineItem) SetQuantity(v int64)`

SetQuantity sets Quantity field to given value.

### HasQuantity

`func (o *LineItem) HasQuantity() bool`

HasQuantity returns a boolean if a field has been set.

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
