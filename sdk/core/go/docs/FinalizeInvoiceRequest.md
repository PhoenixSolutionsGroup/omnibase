# FinalizeInvoiceRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**AutoAdvance** | Pointer to **bool** | Whether to auto-advance the invoice (send immediately) | [optional] 

## Methods

### NewFinalizeInvoiceRequest

`func NewFinalizeInvoiceRequest() *FinalizeInvoiceRequest`

NewFinalizeInvoiceRequest instantiates a new FinalizeInvoiceRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewFinalizeInvoiceRequestWithDefaults

`func NewFinalizeInvoiceRequestWithDefaults() *FinalizeInvoiceRequest`

NewFinalizeInvoiceRequestWithDefaults instantiates a new FinalizeInvoiceRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAutoAdvance

`func (o *FinalizeInvoiceRequest) GetAutoAdvance() bool`

GetAutoAdvance returns the AutoAdvance field if non-nil, zero value otherwise.

### GetAutoAdvanceOk

`func (o *FinalizeInvoiceRequest) GetAutoAdvanceOk() (*bool, bool)`

GetAutoAdvanceOk returns a tuple with the AutoAdvance field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAutoAdvance

`func (o *FinalizeInvoiceRequest) SetAutoAdvance(v bool)`

SetAutoAdvance sets AutoAdvance field to given value.

### HasAutoAdvance

`func (o *FinalizeInvoiceRequest) HasAutoAdvance() bool`

HasAutoAdvance returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


