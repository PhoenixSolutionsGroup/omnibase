# AddLineItemByPriceRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Currency** | **string** |  | 
**Description** | **string** |  | 
**Metadata** | Pointer to **map[string]string** |  | [optional] 
**PriceId** | Pointer to **string** |  | [optional] 
**Quantity** | **int64** |  | 
**StripePriceId** | Pointer to **string** |  | [optional] 

## Methods

### NewAddLineItemByPriceRequest

`func NewAddLineItemByPriceRequest(currency string, description string, quantity int64, ) *AddLineItemByPriceRequest`

NewAddLineItemByPriceRequest instantiates a new AddLineItemByPriceRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAddLineItemByPriceRequestWithDefaults

`func NewAddLineItemByPriceRequestWithDefaults() *AddLineItemByPriceRequest`

NewAddLineItemByPriceRequestWithDefaults instantiates a new AddLineItemByPriceRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCurrency

`func (o *AddLineItemByPriceRequest) GetCurrency() string`

GetCurrency returns the Currency field if non-nil, zero value otherwise.

### GetCurrencyOk

`func (o *AddLineItemByPriceRequest) GetCurrencyOk() (*string, bool)`

GetCurrencyOk returns a tuple with the Currency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrency

`func (o *AddLineItemByPriceRequest) SetCurrency(v string)`

SetCurrency sets Currency field to given value.


### GetDescription

`func (o *AddLineItemByPriceRequest) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *AddLineItemByPriceRequest) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *AddLineItemByPriceRequest) SetDescription(v string)`

SetDescription sets Description field to given value.


### GetMetadata

`func (o *AddLineItemByPriceRequest) GetMetadata() map[string]string`

GetMetadata returns the Metadata field if non-nil, zero value otherwise.

### GetMetadataOk

`func (o *AddLineItemByPriceRequest) GetMetadataOk() (*map[string]string, bool)`

GetMetadataOk returns a tuple with the Metadata field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMetadata

`func (o *AddLineItemByPriceRequest) SetMetadata(v map[string]string)`

SetMetadata sets Metadata field to given value.

### HasMetadata

`func (o *AddLineItemByPriceRequest) HasMetadata() bool`

HasMetadata returns a boolean if a field has been set.

### GetPriceId

`func (o *AddLineItemByPriceRequest) GetPriceId() string`

GetPriceId returns the PriceId field if non-nil, zero value otherwise.

### GetPriceIdOk

`func (o *AddLineItemByPriceRequest) GetPriceIdOk() (*string, bool)`

GetPriceIdOk returns a tuple with the PriceId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPriceId

`func (o *AddLineItemByPriceRequest) SetPriceId(v string)`

SetPriceId sets PriceId field to given value.

### HasPriceId

`func (o *AddLineItemByPriceRequest) HasPriceId() bool`

HasPriceId returns a boolean if a field has been set.

### GetQuantity

`func (o *AddLineItemByPriceRequest) GetQuantity() int64`

GetQuantity returns the Quantity field if non-nil, zero value otherwise.

### GetQuantityOk

`func (o *AddLineItemByPriceRequest) GetQuantityOk() (*int64, bool)`

GetQuantityOk returns a tuple with the Quantity field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetQuantity

`func (o *AddLineItemByPriceRequest) SetQuantity(v int64)`

SetQuantity sets Quantity field to given value.


### GetStripePriceId

`func (o *AddLineItemByPriceRequest) GetStripePriceId() string`

GetStripePriceId returns the StripePriceId field if non-nil, zero value otherwise.

### GetStripePriceIdOk

`func (o *AddLineItemByPriceRequest) GetStripePriceIdOk() (*string, bool)`

GetStripePriceIdOk returns a tuple with the StripePriceId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripePriceId

`func (o *AddLineItemByPriceRequest) SetStripePriceId(v string)`

SetStripePriceId sets StripePriceId field to given value.

### HasStripePriceId

`func (o *AddLineItemByPriceRequest) HasStripePriceId() bool`

HasStripePriceId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


