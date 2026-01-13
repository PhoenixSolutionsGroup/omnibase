# AddInvoiceLineItemWithConfigPriceRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**PriceId** | **string** | Config price ID (e.g., \&quot;hetzner_cx23_nbg1_hourly\&quot;) - looked up via GetStripeIDByConfigID | 
**Quantity** | **int64** | Quantity of units (required, must be at least 1) | 
**Description** | **string** | Description for the line item (required) | 
**Currency** | [**CurrencyCode**](CurrencyCode.md) |  | 
**Metadata** | Pointer to **map[string]string** | Optional metadata key-value pairs (keys must be alphanumeric/underscore, max 40 chars; values max 500 chars) | [optional] 

## Methods

### NewAddInvoiceLineItemWithConfigPriceRequest

`func NewAddInvoiceLineItemWithConfigPriceRequest(priceId string, quantity int64, description string, currency CurrencyCode, ) *AddInvoiceLineItemWithConfigPriceRequest`

NewAddInvoiceLineItemWithConfigPriceRequest instantiates a new AddInvoiceLineItemWithConfigPriceRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAddInvoiceLineItemWithConfigPriceRequestWithDefaults

`func NewAddInvoiceLineItemWithConfigPriceRequestWithDefaults() *AddInvoiceLineItemWithConfigPriceRequest`

NewAddInvoiceLineItemWithConfigPriceRequestWithDefaults instantiates a new AddInvoiceLineItemWithConfigPriceRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPriceId

`func (o *AddInvoiceLineItemWithConfigPriceRequest) GetPriceId() string`

GetPriceId returns the PriceId field if non-nil, zero value otherwise.

### GetPriceIdOk

`func (o *AddInvoiceLineItemWithConfigPriceRequest) GetPriceIdOk() (*string, bool)`

GetPriceIdOk returns a tuple with the PriceId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPriceId

`func (o *AddInvoiceLineItemWithConfigPriceRequest) SetPriceId(v string)`

SetPriceId sets PriceId field to given value.


### GetQuantity

`func (o *AddInvoiceLineItemWithConfigPriceRequest) GetQuantity() int64`

GetQuantity returns the Quantity field if non-nil, zero value otherwise.

### GetQuantityOk

`func (o *AddInvoiceLineItemWithConfigPriceRequest) GetQuantityOk() (*int64, bool)`

GetQuantityOk returns a tuple with the Quantity field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetQuantity

`func (o *AddInvoiceLineItemWithConfigPriceRequest) SetQuantity(v int64)`

SetQuantity sets Quantity field to given value.


### GetDescription

`func (o *AddInvoiceLineItemWithConfigPriceRequest) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *AddInvoiceLineItemWithConfigPriceRequest) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *AddInvoiceLineItemWithConfigPriceRequest) SetDescription(v string)`

SetDescription sets Description field to given value.


### GetCurrency

`func (o *AddInvoiceLineItemWithConfigPriceRequest) GetCurrency() CurrencyCode`

GetCurrency returns the Currency field if non-nil, zero value otherwise.

### GetCurrencyOk

`func (o *AddInvoiceLineItemWithConfigPriceRequest) GetCurrencyOk() (*CurrencyCode, bool)`

GetCurrencyOk returns a tuple with the Currency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrency

`func (o *AddInvoiceLineItemWithConfigPriceRequest) SetCurrency(v CurrencyCode)`

SetCurrency sets Currency field to given value.


### GetMetadata

`func (o *AddInvoiceLineItemWithConfigPriceRequest) GetMetadata() map[string]string`

GetMetadata returns the Metadata field if non-nil, zero value otherwise.

### GetMetadataOk

`func (o *AddInvoiceLineItemWithConfigPriceRequest) GetMetadataOk() (*map[string]string, bool)`

GetMetadataOk returns a tuple with the Metadata field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMetadata

`func (o *AddInvoiceLineItemWithConfigPriceRequest) SetMetadata(v map[string]string)`

SetMetadata sets Metadata field to given value.

### HasMetadata

`func (o *AddInvoiceLineItemWithConfigPriceRequest) HasMetadata() bool`

HasMetadata returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


