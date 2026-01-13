# EnterprisePricesResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Prices** | [**[]PriceWithStripeID**](PriceWithStripeID.md) | List of enterprise prices matching the query | 
**Count** | **int32** | Total number of prices returned | 

## Methods

### NewEnterprisePricesResponse

`func NewEnterprisePricesResponse(prices []PriceWithStripeID, count int32, ) *EnterprisePricesResponse`

NewEnterprisePricesResponse instantiates a new EnterprisePricesResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewEnterprisePricesResponseWithDefaults

`func NewEnterprisePricesResponseWithDefaults() *EnterprisePricesResponse`

NewEnterprisePricesResponseWithDefaults instantiates a new EnterprisePricesResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPrices

`func (o *EnterprisePricesResponse) GetPrices() []PriceWithStripeID`

GetPrices returns the Prices field if non-nil, zero value otherwise.

### GetPricesOk

`func (o *EnterprisePricesResponse) GetPricesOk() (*[]PriceWithStripeID, bool)`

GetPricesOk returns a tuple with the Prices field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPrices

`func (o *EnterprisePricesResponse) SetPrices(v []PriceWithStripeID)`

SetPrices sets Prices field to given value.


### GetCount

`func (o *EnterprisePricesResponse) GetCount() int32`

GetCount returns the Count field if non-nil, zero value otherwise.

### GetCountOk

`func (o *EnterprisePricesResponse) GetCountOk() (*int32, bool)`

GetCountOk returns a tuple with the Count field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCount

`func (o *EnterprisePricesResponse) SetCount(v int32)`

SetCount sets Count field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


