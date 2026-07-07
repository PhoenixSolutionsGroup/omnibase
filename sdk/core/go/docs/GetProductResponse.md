# GetProductResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Product** | [**ProductWithStripeIDs**](ProductWithStripeIDs.md) |  | 

## Methods

### NewGetProductResponse

`func NewGetProductResponse(product ProductWithStripeIDs, ) *GetProductResponse`

NewGetProductResponse instantiates a new GetProductResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetProductResponseWithDefaults

`func NewGetProductResponseWithDefaults() *GetProductResponse`

NewGetProductResponseWithDefaults instantiates a new GetProductResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetProduct

`func (o *GetProductResponse) GetProduct() ProductWithStripeIDs`

GetProduct returns the Product field if non-nil, zero value otherwise.

### GetProductOk

`func (o *GetProductResponse) GetProductOk() (*ProductWithStripeIDs, bool)`

GetProductOk returns a tuple with the Product field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProduct

`func (o *GetProductResponse) SetProduct(v ProductWithStripeIDs)`

SetProduct sets Product field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


