# ProductChange

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Action** | **string** |  | 
**Details** | Pointer to **[]string** |  | [optional] 
**ProductId** | **string** |  | 
**ProductName** | **string** |  | 
**StripeId** | Pointer to **string** |  | [optional] 

## Methods

### NewProductChange

`func NewProductChange(action string, productId string, productName string, ) *ProductChange`

NewProductChange instantiates a new ProductChange object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewProductChangeWithDefaults

`func NewProductChangeWithDefaults() *ProductChange`

NewProductChangeWithDefaults instantiates a new ProductChange object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAction

`func (o *ProductChange) GetAction() string`

GetAction returns the Action field if non-nil, zero value otherwise.

### GetActionOk

`func (o *ProductChange) GetActionOk() (*string, bool)`

GetActionOk returns a tuple with the Action field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAction

`func (o *ProductChange) SetAction(v string)`

SetAction sets Action field to given value.


### GetDetails

`func (o *ProductChange) GetDetails() []string`

GetDetails returns the Details field if non-nil, zero value otherwise.

### GetDetailsOk

`func (o *ProductChange) GetDetailsOk() (*[]string, bool)`

GetDetailsOk returns a tuple with the Details field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDetails

`func (o *ProductChange) SetDetails(v []string)`

SetDetails sets Details field to given value.

### HasDetails

`func (o *ProductChange) HasDetails() bool`

HasDetails returns a boolean if a field has been set.

### SetDetailsNil

`func (o *ProductChange) SetDetailsNil(b bool)`

 SetDetailsNil sets the value for Details to be an explicit nil

### UnsetDetails
`func (o *ProductChange) UnsetDetails()`

UnsetDetails ensures that no value is present for Details, not even an explicit nil
### GetProductId

`func (o *ProductChange) GetProductId() string`

GetProductId returns the ProductId field if non-nil, zero value otherwise.

### GetProductIdOk

`func (o *ProductChange) GetProductIdOk() (*string, bool)`

GetProductIdOk returns a tuple with the ProductId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProductId

`func (o *ProductChange) SetProductId(v string)`

SetProductId sets ProductId field to given value.


### GetProductName

`func (o *ProductChange) GetProductName() string`

GetProductName returns the ProductName field if non-nil, zero value otherwise.

### GetProductNameOk

`func (o *ProductChange) GetProductNameOk() (*string, bool)`

GetProductNameOk returns a tuple with the ProductName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProductName

`func (o *ProductChange) SetProductName(v string)`

SetProductName sets ProductName field to given value.


### GetStripeId

`func (o *ProductChange) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *ProductChange) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *ProductChange) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *ProductChange) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


