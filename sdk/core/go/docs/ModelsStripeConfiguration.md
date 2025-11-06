# ModelsStripeConfiguration

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Meters** | Pointer to [**[]ModelsMeter**](ModelsMeter.md) |  | [optional] 
**Products** | [**[]ModelsProduct**](ModelsProduct.md) |  | 
**Version** | **string** |  | 

## Methods

### NewModelsStripeConfiguration

`func NewModelsStripeConfiguration(products []ModelsProduct, version string, ) *ModelsStripeConfiguration`

NewModelsStripeConfiguration instantiates a new ModelsStripeConfiguration object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsStripeConfigurationWithDefaults

`func NewModelsStripeConfigurationWithDefaults() *ModelsStripeConfiguration`

NewModelsStripeConfigurationWithDefaults instantiates a new ModelsStripeConfiguration object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMeters

`func (o *ModelsStripeConfiguration) GetMeters() []ModelsMeter`

GetMeters returns the Meters field if non-nil, zero value otherwise.

### GetMetersOk

`func (o *ModelsStripeConfiguration) GetMetersOk() (*[]ModelsMeter, bool)`

GetMetersOk returns a tuple with the Meters field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMeters

`func (o *ModelsStripeConfiguration) SetMeters(v []ModelsMeter)`

SetMeters sets Meters field to given value.

### HasMeters

`func (o *ModelsStripeConfiguration) HasMeters() bool`

HasMeters returns a boolean if a field has been set.

### GetProducts

`func (o *ModelsStripeConfiguration) GetProducts() []ModelsProduct`

GetProducts returns the Products field if non-nil, zero value otherwise.

### GetProductsOk

`func (o *ModelsStripeConfiguration) GetProductsOk() (*[]ModelsProduct, bool)`

GetProductsOk returns a tuple with the Products field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProducts

`func (o *ModelsStripeConfiguration) SetProducts(v []ModelsProduct)`

SetProducts sets Products field to given value.


### GetVersion

`func (o *ModelsStripeConfiguration) GetVersion() string`

GetVersion returns the Version field if non-nil, zero value otherwise.

### GetVersionOk

`func (o *ModelsStripeConfiguration) GetVersionOk() (*string, bool)`

GetVersionOk returns a tuple with the Version field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVersion

`func (o *ModelsStripeConfiguration) SetVersion(v string)`

SetVersion sets Version field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


