# GetPriceResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Price** | [**PriceWithStripeID**](PriceWithStripeID.md) |  | 
**Product** | [**ProductWithStripeIDs**](ProductWithStripeIDs.md) |  | 

## Methods

### NewGetPriceResponse

`func NewGetPriceResponse(price PriceWithStripeID, product ProductWithStripeIDs, ) *GetPriceResponse`

NewGetPriceResponse instantiates a new GetPriceResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetPriceResponseWithDefaults

`func NewGetPriceResponseWithDefaults() *GetPriceResponse`

NewGetPriceResponseWithDefaults instantiates a new GetPriceResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPrice

`func (o *GetPriceResponse) GetPrice() PriceWithStripeID`

GetPrice returns the Price field if non-nil, zero value otherwise.

### GetPriceOk

`func (o *GetPriceResponse) GetPriceOk() (*PriceWithStripeID, bool)`

GetPriceOk returns a tuple with the Price field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPrice

`func (o *GetPriceResponse) SetPrice(v PriceWithStripeID)`

SetPrice sets Price field to given value.


### GetProduct

`func (o *GetPriceResponse) GetProduct() ProductWithStripeIDs`

GetProduct returns the Product field if non-nil, zero value otherwise.

### GetProductOk

`func (o *GetPriceResponse) GetProductOk() (*ProductWithStripeIDs, bool)`

GetProductOk returns a tuple with the Product field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProduct

`func (o *GetPriceResponse) SetProduct(v ProductWithStripeIDs)`

SetProduct sets Product field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


