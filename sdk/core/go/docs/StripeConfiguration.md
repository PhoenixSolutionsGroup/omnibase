# StripeConfiguration

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Version** | **string** | Configuration version in semantic versioning format | 
**Webhooks** | Pointer to [**[]WebhookEndpointConfig**](WebhookEndpointConfig.md) | List of webhook endpoint configurations | [optional] 
**Meters** | Pointer to [**[]Meter**](Meter.md) | List of billing meters for metered pricing (required when any price uses usage_type metered) | [optional] 
**Products** | [**[]Product**](Product.md) | List of products with their prices | 
**Coupons** | Pointer to [**[]Coupon**](Coupon.md) | List of discount coupons | [optional] 
**PromotionCodes** | Pointer to [**[]PromotionCode**](PromotionCode.md) | List of promotion codes that apply coupons | [optional] 

## Methods

### NewStripeConfiguration

`func NewStripeConfiguration(version string, products []Product, ) *StripeConfiguration`

NewStripeConfiguration instantiates a new StripeConfiguration object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewStripeConfigurationWithDefaults

`func NewStripeConfigurationWithDefaults() *StripeConfiguration`

NewStripeConfigurationWithDefaults instantiates a new StripeConfiguration object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

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


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


