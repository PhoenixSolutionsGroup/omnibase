# PriceChange

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**PriceId** | **string** | Price config ID | 
**ProductId** | **string** | Parent product config ID | 
**Action** | **string** | Action performed on the price | 
**StripeId** | Pointer to **string** | Stripe price ID (if applicable) | [optional] 

## Methods

### NewPriceChange

`func NewPriceChange(priceId string, productId string, action string, ) *PriceChange`

NewPriceChange instantiates a new PriceChange object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewPriceChangeWithDefaults

`func NewPriceChangeWithDefaults() *PriceChange`

NewPriceChangeWithDefaults instantiates a new PriceChange object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPriceId

`func (o *PriceChange) GetPriceId() string`

GetPriceId returns the PriceId field if non-nil, zero value otherwise.

### GetPriceIdOk

`func (o *PriceChange) GetPriceIdOk() (*string, bool)`

GetPriceIdOk returns a tuple with the PriceId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPriceId

`func (o *PriceChange) SetPriceId(v string)`

SetPriceId sets PriceId field to given value.


### GetProductId

`func (o *PriceChange) GetProductId() string`

GetProductId returns the ProductId field if non-nil, zero value otherwise.

### GetProductIdOk

`func (o *PriceChange) GetProductIdOk() (*string, bool)`

GetProductIdOk returns a tuple with the ProductId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProductId

`func (o *PriceChange) SetProductId(v string)`

SetProductId sets ProductId field to given value.


### GetAction

`func (o *PriceChange) GetAction() string`

GetAction returns the Action field if non-nil, zero value otherwise.

### GetActionOk

`func (o *PriceChange) GetActionOk() (*string, bool)`

GetActionOk returns a tuple with the Action field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAction

`func (o *PriceChange) SetAction(v string)`

SetAction sets Action field to given value.


### GetStripeId

`func (o *PriceChange) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *PriceChange) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *PriceChange) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *PriceChange) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


