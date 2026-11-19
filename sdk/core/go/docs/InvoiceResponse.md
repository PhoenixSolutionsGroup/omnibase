# InvoiceResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**AmountDue** | **int64** |  | 
**Currency** | **string** |  | 
**CustomerId** | **string** |  | 
**HostedInvoiceUrl** | Pointer to **string** |  | [optional] 
**Id** | **string** |  | 
**InvoicePdf** | Pointer to **string** |  | [optional] 
**Status** | **string** |  | 

## Methods

### NewInvoiceResponse

`func NewInvoiceResponse(amountDue int64, currency string, customerId string, id string, status string, ) *InvoiceResponse`

NewInvoiceResponse instantiates a new InvoiceResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewInvoiceResponseWithDefaults

`func NewInvoiceResponseWithDefaults() *InvoiceResponse`

NewInvoiceResponseWithDefaults instantiates a new InvoiceResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAmountDue

`func (o *InvoiceResponse) GetAmountDue() int64`

GetAmountDue returns the AmountDue field if non-nil, zero value otherwise.

### GetAmountDueOk

`func (o *InvoiceResponse) GetAmountDueOk() (*int64, bool)`

GetAmountDueOk returns a tuple with the AmountDue field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAmountDue

`func (o *InvoiceResponse) SetAmountDue(v int64)`

SetAmountDue sets AmountDue field to given value.


### GetCurrency

`func (o *InvoiceResponse) GetCurrency() string`

GetCurrency returns the Currency field if non-nil, zero value otherwise.

### GetCurrencyOk

`func (o *InvoiceResponse) GetCurrencyOk() (*string, bool)`

GetCurrencyOk returns a tuple with the Currency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrency

`func (o *InvoiceResponse) SetCurrency(v string)`

SetCurrency sets Currency field to given value.


### GetCustomerId

`func (o *InvoiceResponse) GetCustomerId() string`

GetCustomerId returns the CustomerId field if non-nil, zero value otherwise.

### GetCustomerIdOk

`func (o *InvoiceResponse) GetCustomerIdOk() (*string, bool)`

GetCustomerIdOk returns a tuple with the CustomerId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCustomerId

`func (o *InvoiceResponse) SetCustomerId(v string)`

SetCustomerId sets CustomerId field to given value.


### GetHostedInvoiceUrl

`func (o *InvoiceResponse) GetHostedInvoiceUrl() string`

GetHostedInvoiceUrl returns the HostedInvoiceUrl field if non-nil, zero value otherwise.

### GetHostedInvoiceUrlOk

`func (o *InvoiceResponse) GetHostedInvoiceUrlOk() (*string, bool)`

GetHostedInvoiceUrlOk returns a tuple with the HostedInvoiceUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHostedInvoiceUrl

`func (o *InvoiceResponse) SetHostedInvoiceUrl(v string)`

SetHostedInvoiceUrl sets HostedInvoiceUrl field to given value.

### HasHostedInvoiceUrl

`func (o *InvoiceResponse) HasHostedInvoiceUrl() bool`

HasHostedInvoiceUrl returns a boolean if a field has been set.

### GetId

`func (o *InvoiceResponse) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *InvoiceResponse) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *InvoiceResponse) SetId(v string)`

SetId sets Id field to given value.


### GetInvoicePdf

`func (o *InvoiceResponse) GetInvoicePdf() string`

GetInvoicePdf returns the InvoicePdf field if non-nil, zero value otherwise.

### GetInvoicePdfOk

`func (o *InvoiceResponse) GetInvoicePdfOk() (*string, bool)`

GetInvoicePdfOk returns a tuple with the InvoicePdf field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInvoicePdf

`func (o *InvoiceResponse) SetInvoicePdf(v string)`

SetInvoicePdf sets InvoicePdf field to given value.

### HasInvoicePdf

`func (o *InvoiceResponse) HasInvoicePdf() bool`

HasInvoicePdf returns a boolean if a field has been set.

### GetStatus

`func (o *InvoiceResponse) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *InvoiceResponse) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *InvoiceResponse) SetStatus(v string)`

SetStatus sets Status field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


