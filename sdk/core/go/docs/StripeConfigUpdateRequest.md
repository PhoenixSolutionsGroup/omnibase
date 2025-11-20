# StripeConfigUpdateRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Version** | **string** | Configuration version (required, semantic version format) | 
**Meters** | Pointer to [**[]Meter**](Meter.md) | List of billing meters (optional array, items must be valid meter objects) | [optional] 
**Products** | [**[]Product**](Product.md) | List of products (required array, items must be valid product objects with id, name, and prices) | 

## Methods

### NewStripeConfigUpdateRequest

`func NewStripeConfigUpdateRequest(version string, products []Product, ) *StripeConfigUpdateRequest`

NewStripeConfigUpdateRequest instantiates a new StripeConfigUpdateRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewStripeConfigUpdateRequestWithDefaults

`func NewStripeConfigUpdateRequestWithDefaults() *StripeConfigUpdateRequest`

NewStripeConfigUpdateRequestWithDefaults instantiates a new StripeConfigUpdateRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetVersion

`func (o *StripeConfigUpdateRequest) GetVersion() string`

GetVersion returns the Version field if non-nil, zero value otherwise.

### GetVersionOk

`func (o *StripeConfigUpdateRequest) GetVersionOk() (*string, bool)`

GetVersionOk returns a tuple with the Version field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVersion

`func (o *StripeConfigUpdateRequest) SetVersion(v string)`

SetVersion sets Version field to given value.


### GetMeters

`func (o *StripeConfigUpdateRequest) GetMeters() []Meter`

GetMeters returns the Meters field if non-nil, zero value otherwise.

### GetMetersOk

`func (o *StripeConfigUpdateRequest) GetMetersOk() (*[]Meter, bool)`

GetMetersOk returns a tuple with the Meters field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMeters

`func (o *StripeConfigUpdateRequest) SetMeters(v []Meter)`

SetMeters sets Meters field to given value.

### HasMeters

`func (o *StripeConfigUpdateRequest) HasMeters() bool`

HasMeters returns a boolean if a field has been set.

### GetProducts

`func (o *StripeConfigUpdateRequest) GetProducts() []Product`

GetProducts returns the Products field if non-nil, zero value otherwise.

### GetProductsOk

`func (o *StripeConfigUpdateRequest) GetProductsOk() (*[]Product, bool)`

GetProductsOk returns a tuple with the Products field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProducts

`func (o *StripeConfigUpdateRequest) SetProducts(v []Product)`

SetProducts sets Products field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


