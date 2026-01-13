# StripeConfigValidateRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Version** | **string** | Configuration version (required, semantic version format) | 
**Webhooks** | Pointer to [**[]WebhookEndpointConfig**](WebhookEndpointConfig.md) | List of webhook endpoint configurations (optional) | [optional] 
**Meters** | Pointer to [**[]Meter**](Meter.md) | List of billing meters (optional array, items must be valid meter objects) | [optional] 
**Products** | [**[]Product**](Product.md) | List of products (required array, items must be valid product objects with id, name, and prices) | 
**Coupons** | Pointer to [**[]Coupon**](Coupon.md) | List of discount coupons (optional) | [optional] 
**PromotionCodes** | Pointer to [**[]PromotionCode**](PromotionCode.md) | List of promotion codes that apply coupons (optional) | [optional] 

## Methods

### NewStripeConfigValidateRequest

`func NewStripeConfigValidateRequest(version string, products []Product, ) *StripeConfigValidateRequest`

NewStripeConfigValidateRequest instantiates a new StripeConfigValidateRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewStripeConfigValidateRequestWithDefaults

`func NewStripeConfigValidateRequestWithDefaults() *StripeConfigValidateRequest`

NewStripeConfigValidateRequestWithDefaults instantiates a new StripeConfigValidateRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetVersion

`func (o *StripeConfigValidateRequest) GetVersion() string`

GetVersion returns the Version field if non-nil, zero value otherwise.

### GetVersionOk

`func (o *StripeConfigValidateRequest) GetVersionOk() (*string, bool)`

GetVersionOk returns a tuple with the Version field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVersion

`func (o *StripeConfigValidateRequest) SetVersion(v string)`

SetVersion sets Version field to given value.


### GetWebhooks

`func (o *StripeConfigValidateRequest) GetWebhooks() []WebhookEndpointConfig`

GetWebhooks returns the Webhooks field if non-nil, zero value otherwise.

### GetWebhooksOk

`func (o *StripeConfigValidateRequest) GetWebhooksOk() (*[]WebhookEndpointConfig, bool)`

GetWebhooksOk returns a tuple with the Webhooks field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhooks

`func (o *StripeConfigValidateRequest) SetWebhooks(v []WebhookEndpointConfig)`

SetWebhooks sets Webhooks field to given value.

### HasWebhooks

`func (o *StripeConfigValidateRequest) HasWebhooks() bool`

HasWebhooks returns a boolean if a field has been set.

### GetMeters

`func (o *StripeConfigValidateRequest) GetMeters() []Meter`

GetMeters returns the Meters field if non-nil, zero value otherwise.

### GetMetersOk

`func (o *StripeConfigValidateRequest) GetMetersOk() (*[]Meter, bool)`

GetMetersOk returns a tuple with the Meters field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMeters

`func (o *StripeConfigValidateRequest) SetMeters(v []Meter)`

SetMeters sets Meters field to given value.

### HasMeters

`func (o *StripeConfigValidateRequest) HasMeters() bool`

HasMeters returns a boolean if a field has been set.

### GetProducts

`func (o *StripeConfigValidateRequest) GetProducts() []Product`

GetProducts returns the Products field if non-nil, zero value otherwise.

### GetProductsOk

`func (o *StripeConfigValidateRequest) GetProductsOk() (*[]Product, bool)`

GetProductsOk returns a tuple with the Products field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProducts

`func (o *StripeConfigValidateRequest) SetProducts(v []Product)`

SetProducts sets Products field to given value.


### GetCoupons

`func (o *StripeConfigValidateRequest) GetCoupons() []Coupon`

GetCoupons returns the Coupons field if non-nil, zero value otherwise.

### GetCouponsOk

`func (o *StripeConfigValidateRequest) GetCouponsOk() (*[]Coupon, bool)`

GetCouponsOk returns a tuple with the Coupons field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCoupons

`func (o *StripeConfigValidateRequest) SetCoupons(v []Coupon)`

SetCoupons sets Coupons field to given value.

### HasCoupons

`func (o *StripeConfigValidateRequest) HasCoupons() bool`

HasCoupons returns a boolean if a field has been set.

### GetPromotionCodes

`func (o *StripeConfigValidateRequest) GetPromotionCodes() []PromotionCode`

GetPromotionCodes returns the PromotionCodes field if non-nil, zero value otherwise.

### GetPromotionCodesOk

`func (o *StripeConfigValidateRequest) GetPromotionCodesOk() (*[]PromotionCode, bool)`

GetPromotionCodesOk returns a tuple with the PromotionCodes field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPromotionCodes

`func (o *StripeConfigValidateRequest) SetPromotionCodes(v []PromotionCode)`

SetPromotionCodes sets PromotionCodes field to given value.

### HasPromotionCodes

`func (o *StripeConfigValidateRequest) HasPromotionCodes() bool`

HasPromotionCodes returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


