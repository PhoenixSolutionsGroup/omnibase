# AddInvoiceLineItem200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Data** | Pointer to [**InvoiceLineItemResponse**](InvoiceLineItemResponse.md) |  | [optional] 

## Methods

### NewAddInvoiceLineItem200Response

`func NewAddInvoiceLineItem200Response(status int32, ) *AddInvoiceLineItem200Response`

NewAddInvoiceLineItem200Response instantiates a new AddInvoiceLineItem200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAddInvoiceLineItem200ResponseWithDefaults

`func NewAddInvoiceLineItem200ResponseWithDefaults() *AddInvoiceLineItem200Response`

NewAddInvoiceLineItem200ResponseWithDefaults instantiates a new AddInvoiceLineItem200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *AddInvoiceLineItem200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *AddInvoiceLineItem200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *AddInvoiceLineItem200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetData

`func (o *AddInvoiceLineItem200Response) GetData() InvoiceLineItemResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *AddInvoiceLineItem200Response) GetDataOk() (*InvoiceLineItemResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *AddInvoiceLineItem200Response) SetData(v InvoiceLineItemResponse)`

SetData sets Data field to given value.

### HasData

`func (o *AddInvoiceLineItem200Response) HasData() bool`

HasData returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


