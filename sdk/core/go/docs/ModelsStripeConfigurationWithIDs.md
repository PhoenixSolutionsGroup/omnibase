# ModelsStripeConfigurationWithIDs

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Meters** | Pointer to [**[]ModelsMeterWithStripeID**](ModelsMeterWithStripeID.md) |  | [optional] 
**Products** | [**[]ModelsProductWithStripeIDs**](ModelsProductWithStripeIDs.md) |  | 
**Version** | **string** |  | 

## Methods

### NewModelsStripeConfigurationWithIDs

`func NewModelsStripeConfigurationWithIDs(products []ModelsProductWithStripeIDs, version string, ) *ModelsStripeConfigurationWithIDs`

NewModelsStripeConfigurationWithIDs instantiates a new ModelsStripeConfigurationWithIDs object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsStripeConfigurationWithIDsWithDefaults

`func NewModelsStripeConfigurationWithIDsWithDefaults() *ModelsStripeConfigurationWithIDs`

NewModelsStripeConfigurationWithIDsWithDefaults instantiates a new ModelsStripeConfigurationWithIDs object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMeters

`func (o *ModelsStripeConfigurationWithIDs) GetMeters() []ModelsMeterWithStripeID`

GetMeters returns the Meters field if non-nil, zero value otherwise.

### GetMetersOk

`func (o *ModelsStripeConfigurationWithIDs) GetMetersOk() (*[]ModelsMeterWithStripeID, bool)`

GetMetersOk returns a tuple with the Meters field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMeters

`func (o *ModelsStripeConfigurationWithIDs) SetMeters(v []ModelsMeterWithStripeID)`

SetMeters sets Meters field to given value.

### HasMeters

`func (o *ModelsStripeConfigurationWithIDs) HasMeters() bool`

HasMeters returns a boolean if a field has been set.

### GetProducts

`func (o *ModelsStripeConfigurationWithIDs) GetProducts() []ModelsProductWithStripeIDs`

GetProducts returns the Products field if non-nil, zero value otherwise.

### GetProductsOk

`func (o *ModelsStripeConfigurationWithIDs) GetProductsOk() (*[]ModelsProductWithStripeIDs, bool)`

GetProductsOk returns a tuple with the Products field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProducts

`func (o *ModelsStripeConfigurationWithIDs) SetProducts(v []ModelsProductWithStripeIDs)`

SetProducts sets Products field to given value.


### GetVersion

`func (o *ModelsStripeConfigurationWithIDs) GetVersion() string`

GetVersion returns the Version field if non-nil, zero value otherwise.

### GetVersionOk

`func (o *ModelsStripeConfigurationWithIDs) GetVersionOk() (*string, bool)`

GetVersionOk returns a tuple with the Version field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVersion

`func (o *ModelsStripeConfigurationWithIDs) SetVersion(v string)`

SetVersion sets Version field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


