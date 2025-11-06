# ModelsProduct

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Description** | Pointer to **string** |  | [optional] 
**Id** | **string** |  | 
**Name** | **string** |  | 
**Prices** | [**[]ModelsPrice**](ModelsPrice.md) |  | 
**Type** | Pointer to **string** | service, good, metered | [optional] 
**Ui** | Pointer to [**ModelsProductUI**](ModelsProductUI.md) |  | [optional] 

## Methods

### NewModelsProduct

`func NewModelsProduct(id string, name string, prices []ModelsPrice, ) *ModelsProduct`

NewModelsProduct instantiates a new ModelsProduct object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsProductWithDefaults

`func NewModelsProductWithDefaults() *ModelsProduct`

NewModelsProductWithDefaults instantiates a new ModelsProduct object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDescription

`func (o *ModelsProduct) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *ModelsProduct) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *ModelsProduct) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *ModelsProduct) HasDescription() bool`

HasDescription returns a boolean if a field has been set.

### GetId

`func (o *ModelsProduct) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ModelsProduct) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ModelsProduct) SetId(v string)`

SetId sets Id field to given value.


### GetName

`func (o *ModelsProduct) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *ModelsProduct) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *ModelsProduct) SetName(v string)`

SetName sets Name field to given value.


### GetPrices

`func (o *ModelsProduct) GetPrices() []ModelsPrice`

GetPrices returns the Prices field if non-nil, zero value otherwise.

### GetPricesOk

`func (o *ModelsProduct) GetPricesOk() (*[]ModelsPrice, bool)`

GetPricesOk returns a tuple with the Prices field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPrices

`func (o *ModelsProduct) SetPrices(v []ModelsPrice)`

SetPrices sets Prices field to given value.


### GetType

`func (o *ModelsProduct) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *ModelsProduct) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *ModelsProduct) SetType(v string)`

SetType sets Type field to given value.

### HasType

`func (o *ModelsProduct) HasType() bool`

HasType returns a boolean if a field has been set.

### GetUi

`func (o *ModelsProduct) GetUi() ModelsProductUI`

GetUi returns the Ui field if non-nil, zero value otherwise.

### GetUiOk

`func (o *ModelsProduct) GetUiOk() (*ModelsProductUI, bool)`

GetUiOk returns a tuple with the Ui field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUi

`func (o *ModelsProduct) SetUi(v ModelsProductUI)`

SetUi sets Ui field to given value.

### HasUi

`func (o *ModelsProduct) HasUi() bool`

HasUi returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


