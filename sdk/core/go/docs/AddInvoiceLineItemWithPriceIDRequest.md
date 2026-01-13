# AddInvoiceLineItemWithPriceIDRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**PriceId** | **string** | Config price ID (e.g., \&quot;hetzner_cx23_nbg1_hourly\&quot;) - looked up via GetStripeIDByConfigID | 
**Quantity** | **int64** | Quantity of units (required, must be at least 1) | 
**Description** | **string** | Description for the line item (required) | 
**Currency** | [**CurrencyCode**](CurrencyCode.md) |  | 
**Metadata** | Pointer to **map[string]string** | Optional metadata key-value pairs (keys must be alphanumeric/underscore, max 40 chars; values max 500 chars) | [optional] 
**StripePriceId** | **string** | Raw Stripe price ID (e.g., \&quot;price_1ABC...\&quot;) - used directly | 

## Methods

### NewAddInvoiceLineItemWithPriceIDRequest

`func NewAddInvoiceLineItemWithPriceIDRequest(priceId string, quantity int64, description string, currency CurrencyCode, stripePriceId string, ) *AddInvoiceLineItemWithPriceIDRequest`

NewAddInvoiceLineItemWithPriceIDRequest instantiates a new AddInvoiceLineItemWithPriceIDRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAddInvoiceLineItemWithPriceIDRequestWithDefaults

`func NewAddInvoiceLineItemWithPriceIDRequestWithDefaults() *AddInvoiceLineItemWithPriceIDRequest`

NewAddInvoiceLineItemWithPriceIDRequestWithDefaults instantiates a new AddInvoiceLineItemWithPriceIDRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPriceId

`func (o *AddInvoiceLineItemWithPriceIDRequest) GetPriceId() string`

GetPriceId returns the PriceId field if non-nil, zero value otherwise.

### GetPriceIdOk

`func (o *AddInvoiceLineItemWithPriceIDRequest) GetPriceIdOk() (*string, bool)`

GetPriceIdOk returns a tuple with the PriceId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPriceId

`func (o *AddInvoiceLineItemWithPriceIDRequest) SetPriceId(v string)`

SetPriceId sets PriceId field to given value.


### GetQuantity

`func (o *AddInvoiceLineItemWithPriceIDRequest) GetQuantity() int64`

GetQuantity returns the Quantity field if non-nil, zero value otherwise.

### GetQuantityOk

`func (o *AddInvoiceLineItemWithPriceIDRequest) GetQuantityOk() (*int64, bool)`

GetQuantityOk returns a tuple with the Quantity field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetQuantity

`func (o *AddInvoiceLineItemWithPriceIDRequest) SetQuantity(v int64)`

SetQuantity sets Quantity field to given value.


### GetDescription

`func (o *AddInvoiceLineItemWithPriceIDRequest) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *AddInvoiceLineItemWithPriceIDRequest) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *AddInvoiceLineItemWithPriceIDRequest) SetDescription(v string)`

SetDescription sets Description field to given value.


### GetCurrency

`func (o *AddInvoiceLineItemWithPriceIDRequest) GetCurrency() CurrencyCode`

GetCurrency returns the Currency field if non-nil, zero value otherwise.

### GetCurrencyOk

`func (o *AddInvoiceLineItemWithPriceIDRequest) GetCurrencyOk() (*CurrencyCode, bool)`

GetCurrencyOk returns a tuple with the Currency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrency

`func (o *AddInvoiceLineItemWithPriceIDRequest) SetCurrency(v CurrencyCode)`

SetCurrency sets Currency field to given value.


### GetMetadata

`func (o *AddInvoiceLineItemWithPriceIDRequest) GetMetadata() map[string]string`

GetMetadata returns the Metadata field if non-nil, zero value otherwise.

### GetMetadataOk

`func (o *AddInvoiceLineItemWithPriceIDRequest) GetMetadataOk() (*map[string]string, bool)`

GetMetadataOk returns a tuple with the Metadata field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMetadata

`func (o *AddInvoiceLineItemWithPriceIDRequest) SetMetadata(v map[string]string)`

SetMetadata sets Metadata field to given value.

### HasMetadata

`func (o *AddInvoiceLineItemWithPriceIDRequest) HasMetadata() bool`

HasMetadata returns a boolean if a field has been set.

### GetStripePriceId

`func (o *AddInvoiceLineItemWithPriceIDRequest) GetStripePriceId() string`

GetStripePriceId returns the StripePriceId field if non-nil, zero value otherwise.

### GetStripePriceIdOk

`func (o *AddInvoiceLineItemWithPriceIDRequest) GetStripePriceIdOk() (*string, bool)`

GetStripePriceIdOk returns a tuple with the StripePriceId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripePriceId

`func (o *AddInvoiceLineItemWithPriceIDRequest) SetStripePriceId(v string)`

SetStripePriceId sets StripePriceId field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


