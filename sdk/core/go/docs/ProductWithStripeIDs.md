# ProductWithStripeIDs

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** | Product identifier (config ID) | 
**Name** | **string** | Product name | 
**Description** | Pointer to **string** | Product description | [optional] 
**Type** | Pointer to **string** | Product type | [optional] 
**Prices** | [**[]PriceWithStripeID**](PriceWithStripeID.md) | List of prices with Stripe IDs | 
**Ui** | Pointer to [**ProductUI**](ProductUI.md) |  | [optional] 
**StripeId** | Pointer to **string** | Actual Stripe product ID (null for free products) | [optional] 

## Methods

### NewProductWithStripeIDs

`func NewProductWithStripeIDs(id string, name string, prices []PriceWithStripeID, ) *ProductWithStripeIDs`

NewProductWithStripeIDs instantiates a new ProductWithStripeIDs object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewProductWithStripeIDsWithDefaults

`func NewProductWithStripeIDsWithDefaults() *ProductWithStripeIDs`

NewProductWithStripeIDsWithDefaults instantiates a new ProductWithStripeIDs object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *ProductWithStripeIDs) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ProductWithStripeIDs) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ProductWithStripeIDs) SetId(v string)`

SetId sets Id field to given value.


### GetName

`func (o *ProductWithStripeIDs) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *ProductWithStripeIDs) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *ProductWithStripeIDs) SetName(v string)`

SetName sets Name field to given value.


### GetDescription

`func (o *ProductWithStripeIDs) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *ProductWithStripeIDs) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *ProductWithStripeIDs) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *ProductWithStripeIDs) HasDescription() bool`

HasDescription returns a boolean if a field has been set.

### GetType

`func (o *ProductWithStripeIDs) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *ProductWithStripeIDs) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *ProductWithStripeIDs) SetType(v string)`

SetType sets Type field to given value.

### HasType

`func (o *ProductWithStripeIDs) HasType() bool`

HasType returns a boolean if a field has been set.

### GetPrices

`func (o *ProductWithStripeIDs) GetPrices() []PriceWithStripeID`

GetPrices returns the Prices field if non-nil, zero value otherwise.

### GetPricesOk

`func (o *ProductWithStripeIDs) GetPricesOk() (*[]PriceWithStripeID, bool)`

GetPricesOk returns a tuple with the Prices field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPrices

`func (o *ProductWithStripeIDs) SetPrices(v []PriceWithStripeID)`

SetPrices sets Prices field to given value.


### GetUi

`func (o *ProductWithStripeIDs) GetUi() ProductUI`

GetUi returns the Ui field if non-nil, zero value otherwise.

### GetUiOk

`func (o *ProductWithStripeIDs) GetUiOk() (*ProductUI, bool)`

GetUiOk returns a tuple with the Ui field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUi

`func (o *ProductWithStripeIDs) SetUi(v ProductUI)`

SetUi sets Ui field to given value.

### HasUi

`func (o *ProductWithStripeIDs) HasUi() bool`

HasUi returns a boolean if a field has been set.

### GetStripeId

`func (o *ProductWithStripeIDs) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *ProductWithStripeIDs) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *ProductWithStripeIDs) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *ProductWithStripeIDs) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


