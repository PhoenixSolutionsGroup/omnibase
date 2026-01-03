# AddInvoiceLineItemRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Amount** | **int64** | Amount in cents (required) | 
**Description** | **string** | Description for the line item (required) | 
**Currency** | [**CurrencyCode**](CurrencyCode.md) |  | 

## Methods

### NewAddInvoiceLineItemRequest

`func NewAddInvoiceLineItemRequest(amount int64, description string, currency CurrencyCode, ) *AddInvoiceLineItemRequest`

NewAddInvoiceLineItemRequest instantiates a new AddInvoiceLineItemRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAddInvoiceLineItemRequestWithDefaults

`func NewAddInvoiceLineItemRequestWithDefaults() *AddInvoiceLineItemRequest`

NewAddInvoiceLineItemRequestWithDefaults instantiates a new AddInvoiceLineItemRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAmount

`func (o *AddInvoiceLineItemRequest) GetAmount() int64`

GetAmount returns the Amount field if non-nil, zero value otherwise.

### GetAmountOk

`func (o *AddInvoiceLineItemRequest) GetAmountOk() (*int64, bool)`

GetAmountOk returns a tuple with the Amount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAmount

`func (o *AddInvoiceLineItemRequest) SetAmount(v int64)`

SetAmount sets Amount field to given value.


### GetDescription

`func (o *AddInvoiceLineItemRequest) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *AddInvoiceLineItemRequest) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *AddInvoiceLineItemRequest) SetDescription(v string)`

SetDescription sets Description field to given value.


### GetCurrency

`func (o *AddInvoiceLineItemRequest) GetCurrency() CurrencyCode`

GetCurrency returns the Currency field if non-nil, zero value otherwise.

### GetCurrencyOk

`func (o *AddInvoiceLineItemRequest) GetCurrencyOk() (*CurrencyCode, bool)`

GetCurrencyOk returns a tuple with the Currency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrency

`func (o *AddInvoiceLineItemRequest) SetCurrency(v CurrencyCode)`

SetCurrency sets Currency field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


