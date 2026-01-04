# AddInvoiceLineItemWithStripePriceRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**StripePriceId** | **string** | Raw Stripe price ID (e.g., \&quot;price_1ABC...\&quot;) - used directly | 
**Quantity** | **int64** | Quantity of units (required, must be at least 1) | 
**Description** | **string** | Description for the line item (required) | 
**Currency** | [**CurrencyCode**](CurrencyCode.md) |  | 
**Metadata** | Pointer to **map[string]string** | Optional metadata key-value pairs (keys must be alphanumeric/underscore, max 40 chars; values max 500 chars) | [optional] 

## Methods

### NewAddInvoiceLineItemWithStripePriceRequest

`func NewAddInvoiceLineItemWithStripePriceRequest(stripePriceId string, quantity int64, description string, currency CurrencyCode, ) *AddInvoiceLineItemWithStripePriceRequest`

NewAddInvoiceLineItemWithStripePriceRequest instantiates a new AddInvoiceLineItemWithStripePriceRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAddInvoiceLineItemWithStripePriceRequestWithDefaults

`func NewAddInvoiceLineItemWithStripePriceRequestWithDefaults() *AddInvoiceLineItemWithStripePriceRequest`

NewAddInvoiceLineItemWithStripePriceRequestWithDefaults instantiates a new AddInvoiceLineItemWithStripePriceRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStripePriceId

`func (o *AddInvoiceLineItemWithStripePriceRequest) GetStripePriceId() string`

GetStripePriceId returns the StripePriceId field if non-nil, zero value otherwise.

### GetStripePriceIdOk

`func (o *AddInvoiceLineItemWithStripePriceRequest) GetStripePriceIdOk() (*string, bool)`

GetStripePriceIdOk returns a tuple with the StripePriceId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripePriceId

`func (o *AddInvoiceLineItemWithStripePriceRequest) SetStripePriceId(v string)`

SetStripePriceId sets StripePriceId field to given value.


### GetQuantity

`func (o *AddInvoiceLineItemWithStripePriceRequest) GetQuantity() int64`

GetQuantity returns the Quantity field if non-nil, zero value otherwise.

### GetQuantityOk

`func (o *AddInvoiceLineItemWithStripePriceRequest) GetQuantityOk() (*int64, bool)`

GetQuantityOk returns a tuple with the Quantity field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetQuantity

`func (o *AddInvoiceLineItemWithStripePriceRequest) SetQuantity(v int64)`

SetQuantity sets Quantity field to given value.


### GetDescription

`func (o *AddInvoiceLineItemWithStripePriceRequest) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *AddInvoiceLineItemWithStripePriceRequest) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *AddInvoiceLineItemWithStripePriceRequest) SetDescription(v string)`

SetDescription sets Description field to given value.


### GetCurrency

`func (o *AddInvoiceLineItemWithStripePriceRequest) GetCurrency() CurrencyCode`

GetCurrency returns the Currency field if non-nil, zero value otherwise.

### GetCurrencyOk

`func (o *AddInvoiceLineItemWithStripePriceRequest) GetCurrencyOk() (*CurrencyCode, bool)`

GetCurrencyOk returns a tuple with the Currency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrency

`func (o *AddInvoiceLineItemWithStripePriceRequest) SetCurrency(v CurrencyCode)`

SetCurrency sets Currency field to given value.


### GetMetadata

`func (o *AddInvoiceLineItemWithStripePriceRequest) GetMetadata() map[string]string`

GetMetadata returns the Metadata field if non-nil, zero value otherwise.

### GetMetadataOk

`func (o *AddInvoiceLineItemWithStripePriceRequest) GetMetadataOk() (*map[string]string, bool)`

GetMetadataOk returns a tuple with the Metadata field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMetadata

`func (o *AddInvoiceLineItemWithStripePriceRequest) SetMetadata(v map[string]string)`

SetMetadata sets Metadata field to given value.

### HasMetadata

`func (o *AddInvoiceLineItemWithStripePriceRequest) HasMetadata() bool`

HasMetadata returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


