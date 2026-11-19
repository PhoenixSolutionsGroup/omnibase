# EnterprisePricesResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Count** | **int64** |  | 
**Prices** | [**[]PriceWithStripeID**](PriceWithStripeID.md) |  | 

## Methods

### NewEnterprisePricesResponse

`func NewEnterprisePricesResponse(count int64, prices []PriceWithStripeID, ) *EnterprisePricesResponse`

NewEnterprisePricesResponse instantiates a new EnterprisePricesResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewEnterprisePricesResponseWithDefaults

`func NewEnterprisePricesResponseWithDefaults() *EnterprisePricesResponse`

NewEnterprisePricesResponseWithDefaults instantiates a new EnterprisePricesResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCount

`func (o *EnterprisePricesResponse) GetCount() int64`

GetCount returns the Count field if non-nil, zero value otherwise.

### GetCountOk

`func (o *EnterprisePricesResponse) GetCountOk() (*int64, bool)`

GetCountOk returns a tuple with the Count field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCount

`func (o *EnterprisePricesResponse) SetCount(v int64)`

SetCount sets Count field to given value.


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


### SetPricesNil

`func (o *EnterprisePricesResponse) SetPricesNil(b bool)`

 SetPricesNil sets the value for Prices to be an explicit nil

### UnsetPrices
`func (o *EnterprisePricesResponse) UnsetPrices()`

UnsetPrices ensures that no value is present for Prices, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


