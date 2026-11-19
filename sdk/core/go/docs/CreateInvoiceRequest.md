# CreateInvoiceRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**AutoAdvance** | Pointer to **bool** |  | [optional] 
**CollectionMethod** | Pointer to **string** |  | [optional] 
**Currency** | **string** |  | 
**DaysUntilDue** | Pointer to **int64** |  | [optional] 
**Description** | Pointer to **string** |  | [optional] 
**Metadata** | Pointer to **map[string]string** |  | [optional] 

## Methods

### NewCreateInvoiceRequest

`func NewCreateInvoiceRequest(currency string, ) *CreateInvoiceRequest`

NewCreateInvoiceRequest instantiates a new CreateInvoiceRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateInvoiceRequestWithDefaults

`func NewCreateInvoiceRequestWithDefaults() *CreateInvoiceRequest`

NewCreateInvoiceRequestWithDefaults instantiates a new CreateInvoiceRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAutoAdvance

`func (o *CreateInvoiceRequest) GetAutoAdvance() bool`

GetAutoAdvance returns the AutoAdvance field if non-nil, zero value otherwise.

### GetAutoAdvanceOk

`func (o *CreateInvoiceRequest) GetAutoAdvanceOk() (*bool, bool)`

GetAutoAdvanceOk returns a tuple with the AutoAdvance field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAutoAdvance

`func (o *CreateInvoiceRequest) SetAutoAdvance(v bool)`

SetAutoAdvance sets AutoAdvance field to given value.

### HasAutoAdvance

`func (o *CreateInvoiceRequest) HasAutoAdvance() bool`

HasAutoAdvance returns a boolean if a field has been set.

### GetCollectionMethod

`func (o *CreateInvoiceRequest) GetCollectionMethod() string`

GetCollectionMethod returns the CollectionMethod field if non-nil, zero value otherwise.

### GetCollectionMethodOk

`func (o *CreateInvoiceRequest) GetCollectionMethodOk() (*string, bool)`

GetCollectionMethodOk returns a tuple with the CollectionMethod field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCollectionMethod

`func (o *CreateInvoiceRequest) SetCollectionMethod(v string)`

SetCollectionMethod sets CollectionMethod field to given value.

### HasCollectionMethod

`func (o *CreateInvoiceRequest) HasCollectionMethod() bool`

HasCollectionMethod returns a boolean if a field has been set.

### GetCurrency

`func (o *CreateInvoiceRequest) GetCurrency() string`

GetCurrency returns the Currency field if non-nil, zero value otherwise.

### GetCurrencyOk

`func (o *CreateInvoiceRequest) GetCurrencyOk() (*string, bool)`

GetCurrencyOk returns a tuple with the Currency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrency

`func (o *CreateInvoiceRequest) SetCurrency(v string)`

SetCurrency sets Currency field to given value.


### GetDaysUntilDue

`func (o *CreateInvoiceRequest) GetDaysUntilDue() int64`

GetDaysUntilDue returns the DaysUntilDue field if non-nil, zero value otherwise.

### GetDaysUntilDueOk

`func (o *CreateInvoiceRequest) GetDaysUntilDueOk() (*int64, bool)`

GetDaysUntilDueOk returns a tuple with the DaysUntilDue field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDaysUntilDue

`func (o *CreateInvoiceRequest) SetDaysUntilDue(v int64)`

SetDaysUntilDue sets DaysUntilDue field to given value.

### HasDaysUntilDue

`func (o *CreateInvoiceRequest) HasDaysUntilDue() bool`

HasDaysUntilDue returns a boolean if a field has been set.

### GetDescription

`func (o *CreateInvoiceRequest) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *CreateInvoiceRequest) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *CreateInvoiceRequest) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *CreateInvoiceRequest) HasDescription() bool`

HasDescription returns a boolean if a field has been set.

### GetMetadata

`func (o *CreateInvoiceRequest) GetMetadata() map[string]string`

GetMetadata returns the Metadata field if non-nil, zero value otherwise.

### GetMetadataOk

`func (o *CreateInvoiceRequest) GetMetadataOk() (*map[string]string, bool)`

GetMetadataOk returns a tuple with the Metadata field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMetadata

`func (o *CreateInvoiceRequest) SetMetadata(v map[string]string)`

SetMetadata sets Metadata field to given value.

### HasMetadata

`func (o *CreateInvoiceRequest) HasMetadata() bool`

HasMetadata returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


