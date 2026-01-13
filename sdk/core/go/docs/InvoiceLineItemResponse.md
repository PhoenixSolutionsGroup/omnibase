# InvoiceLineItemResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** | Stripe Invoice Item ID | 
**Amount** | Pointer to **int64** | Amount in cents | [optional] 
**Description** | Pointer to **string** | Description | [optional] 

## Methods

### NewInvoiceLineItemResponse

`func NewInvoiceLineItemResponse(id string, ) *InvoiceLineItemResponse`

NewInvoiceLineItemResponse instantiates a new InvoiceLineItemResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewInvoiceLineItemResponseWithDefaults

`func NewInvoiceLineItemResponseWithDefaults() *InvoiceLineItemResponse`

NewInvoiceLineItemResponseWithDefaults instantiates a new InvoiceLineItemResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *InvoiceLineItemResponse) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *InvoiceLineItemResponse) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *InvoiceLineItemResponse) SetId(v string)`

SetId sets Id field to given value.


### GetAmount

`func (o *InvoiceLineItemResponse) GetAmount() int64`

GetAmount returns the Amount field if non-nil, zero value otherwise.

### GetAmountOk

`func (o *InvoiceLineItemResponse) GetAmountOk() (*int64, bool)`

GetAmountOk returns a tuple with the Amount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAmount

`func (o *InvoiceLineItemResponse) SetAmount(v int64)`

SetAmount sets Amount field to given value.

### HasAmount

`func (o *InvoiceLineItemResponse) HasAmount() bool`

HasAmount returns a boolean if a field has been set.

### GetDescription

`func (o *InvoiceLineItemResponse) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *InvoiceLineItemResponse) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *InvoiceLineItemResponse) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *InvoiceLineItemResponse) HasDescription() bool`

HasDescription returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


