# ModelsProductWithStripeIDs

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Description** | Pointer to **string** |  | [optional] 
**Id** | **string** |  | 
**Name** | **string** |  | 
**Prices** | [**[]ModelsPriceWithStripeID**](ModelsPriceWithStripeID.md) |  | 
**StripeId** | Pointer to **string** | actual Stripe product ID (null for free products) | [optional] 
**Type** | Pointer to **string** | service, good, metered | [optional] 
**Ui** | Pointer to [**ModelsProductUI**](ModelsProductUI.md) |  | [optional] 

## Methods

### NewModelsProductWithStripeIDs

`func NewModelsProductWithStripeIDs(id string, name string, prices []ModelsPriceWithStripeID, ) *ModelsProductWithStripeIDs`

NewModelsProductWithStripeIDs instantiates a new ModelsProductWithStripeIDs object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsProductWithStripeIDsWithDefaults

`func NewModelsProductWithStripeIDsWithDefaults() *ModelsProductWithStripeIDs`

NewModelsProductWithStripeIDsWithDefaults instantiates a new ModelsProductWithStripeIDs object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDescription

`func (o *ModelsProductWithStripeIDs) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *ModelsProductWithStripeIDs) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *ModelsProductWithStripeIDs) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *ModelsProductWithStripeIDs) HasDescription() bool`

HasDescription returns a boolean if a field has been set.

### GetId

`func (o *ModelsProductWithStripeIDs) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ModelsProductWithStripeIDs) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ModelsProductWithStripeIDs) SetId(v string)`

SetId sets Id field to given value.


### GetName

`func (o *ModelsProductWithStripeIDs) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *ModelsProductWithStripeIDs) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *ModelsProductWithStripeIDs) SetName(v string)`

SetName sets Name field to given value.


### GetPrices

`func (o *ModelsProductWithStripeIDs) GetPrices() []ModelsPriceWithStripeID`

GetPrices returns the Prices field if non-nil, zero value otherwise.

### GetPricesOk

`func (o *ModelsProductWithStripeIDs) GetPricesOk() (*[]ModelsPriceWithStripeID, bool)`

GetPricesOk returns a tuple with the Prices field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPrices

`func (o *ModelsProductWithStripeIDs) SetPrices(v []ModelsPriceWithStripeID)`

SetPrices sets Prices field to given value.


### GetStripeId

`func (o *ModelsProductWithStripeIDs) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *ModelsProductWithStripeIDs) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *ModelsProductWithStripeIDs) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *ModelsProductWithStripeIDs) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.

### GetType

`func (o *ModelsProductWithStripeIDs) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *ModelsProductWithStripeIDs) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *ModelsProductWithStripeIDs) SetType(v string)`

SetType sets Type field to given value.

### HasType

`func (o *ModelsProductWithStripeIDs) HasType() bool`

HasType returns a boolean if a field has been set.

### GetUi

`func (o *ModelsProductWithStripeIDs) GetUi() ModelsProductUI`

GetUi returns the Ui field if non-nil, zero value otherwise.

### GetUiOk

`func (o *ModelsProductWithStripeIDs) GetUiOk() (*ModelsProductUI, bool)`

GetUiOk returns a tuple with the Ui field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUi

`func (o *ModelsProductWithStripeIDs) SetUi(v ModelsProductUI)`

SetUi sets Ui field to given value.

### HasUi

`func (o *ModelsProductWithStripeIDs) HasUi() bool`

HasUi returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


