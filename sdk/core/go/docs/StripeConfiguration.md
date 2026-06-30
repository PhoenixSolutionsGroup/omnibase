# StripeConfiguration

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Coupons** | Pointer to [**[]Coupon**](Coupon.md) |  | [optional] 
**Meters** | Pointer to [**[]Meter**](Meter.md) |  | [optional] 
**Products** | [**[]Product**](Product.md) |  | 
**PromotionCodes** | Pointer to [**[]PromotionCode**](PromotionCode.md) |  | [optional] 
**Version** | **string** |  | 
**Webhooks** | Pointer to [**[]WebhookEndpointConfig**](WebhookEndpointConfig.md) |  | [optional] 

## Methods

### NewStripeConfiguration

`func NewStripeConfiguration(products []Product, version string, ) *StripeConfiguration`

NewStripeConfiguration instantiates a new StripeConfiguration object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewStripeConfigurationWithDefaults

`func NewStripeConfigurationWithDefaults() *StripeConfiguration`

NewStripeConfigurationWithDefaults instantiates a new StripeConfiguration object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCoupons

`func (o *StripeConfiguration) GetCoupons() []Coupon`

GetCoupons returns the Coupons field if non-nil, zero value otherwise.

### GetCouponsOk

`func (o *StripeConfiguration) GetCouponsOk() (*[]Coupon, bool)`

GetCouponsOk returns a tuple with the Coupons field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCoupons

`func (o *StripeConfiguration) SetCoupons(v []Coupon)`

SetCoupons sets Coupons field to given value.

### HasCoupons

`func (o *StripeConfiguration) HasCoupons() bool`

HasCoupons returns a boolean if a field has been set.

### SetCouponsNil

`func (o *StripeConfiguration) SetCouponsNil(b bool)`

 SetCouponsNil sets the value for Coupons to be an explicit nil

### UnsetCoupons
`func (o *StripeConfiguration) UnsetCoupons()`

UnsetCoupons ensures that no value is present for Coupons, not even an explicit nil
### GetMeters

`func (o *StripeConfiguration) GetMeters() []Meter`

GetMeters returns the Meters field if non-nil, zero value otherwise.

### GetMetersOk

`func (o *StripeConfiguration) GetMetersOk() (*[]Meter, bool)`

GetMetersOk returns a tuple with the Meters field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMeters

`func (o *StripeConfiguration) SetMeters(v []Meter)`

SetMeters sets Meters field to given value.

### HasMeters

`func (o *StripeConfiguration) HasMeters() bool`

HasMeters returns a boolean if a field has been set.

### SetMetersNil

`func (o *StripeConfiguration) SetMetersNil(b bool)`

 SetMetersNil sets the value for Meters to be an explicit nil

### UnsetMeters
`func (o *StripeConfiguration) UnsetMeters()`

UnsetMeters ensures that no value is present for Meters, not even an explicit nil
### GetProducts

`func (o *StripeConfiguration) GetProducts() []Product`

GetProducts returns the Products field if non-nil, zero value otherwise.

### GetProductsOk

`func (o *StripeConfiguration) GetProductsOk() (*[]Product, bool)`

GetProductsOk returns a tuple with the Products field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProducts

`func (o *StripeConfiguration) SetProducts(v []Product)`

SetProducts sets Products field to given value.


### SetProductsNil

`func (o *StripeConfiguration) SetProductsNil(b bool)`

 SetProductsNil sets the value for Products to be an explicit nil

### UnsetProducts
`func (o *StripeConfiguration) UnsetProducts()`

UnsetProducts ensures that no value is present for Products, not even an explicit nil
### GetPromotionCodes

`func (o *StripeConfiguration) GetPromotionCodes() []PromotionCode`

GetPromotionCodes returns the PromotionCodes field if non-nil, zero value otherwise.

### GetPromotionCodesOk

`func (o *StripeConfiguration) GetPromotionCodesOk() (*[]PromotionCode, bool)`

GetPromotionCodesOk returns a tuple with the PromotionCodes field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPromotionCodes

`func (o *StripeConfiguration) SetPromotionCodes(v []PromotionCode)`

SetPromotionCodes sets PromotionCodes field to given value.

### HasPromotionCodes

`func (o *StripeConfiguration) HasPromotionCodes() bool`

HasPromotionCodes returns a boolean if a field has been set.

### SetPromotionCodesNil

`func (o *StripeConfiguration) SetPromotionCodesNil(b bool)`

 SetPromotionCodesNil sets the value for PromotionCodes to be an explicit nil

### UnsetPromotionCodes
`func (o *StripeConfiguration) UnsetPromotionCodes()`

UnsetPromotionCodes ensures that no value is present for PromotionCodes, not even an explicit nil
### GetVersion

`func (o *StripeConfiguration) GetVersion() string`

GetVersion returns the Version field if non-nil, zero value otherwise.

### GetVersionOk

`func (o *StripeConfiguration) GetVersionOk() (*string, bool)`

GetVersionOk returns a tuple with the Version field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVersion

`func (o *StripeConfiguration) SetVersion(v string)`

SetVersion sets Version field to given value.


### GetWebhooks

`func (o *StripeConfiguration) GetWebhooks() []WebhookEndpointConfig`

GetWebhooks returns the Webhooks field if non-nil, zero value otherwise.

### GetWebhooksOk

`func (o *StripeConfiguration) GetWebhooksOk() (*[]WebhookEndpointConfig, bool)`

GetWebhooksOk returns a tuple with the Webhooks field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhooks

`func (o *StripeConfiguration) SetWebhooks(v []WebhookEndpointConfig)`

SetWebhooks sets Webhooks field to given value.

### HasWebhooks

`func (o *StripeConfiguration) HasWebhooks() bool`

HasWebhooks returns a boolean if a field has been set.

### SetWebhooksNil

`func (o *StripeConfiguration) SetWebhooksNil(b bool)`

 SetWebhooksNil sets the value for Webhooks to be an explicit nil

### UnsetWebhooks
`func (o *StripeConfiguration) UnsetWebhooks()`

UnsetWebhooks ensures that no value is present for Webhooks, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


