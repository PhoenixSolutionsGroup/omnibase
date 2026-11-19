# ConfigChanges

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Coupons** | Pointer to [**CouponChanges**](CouponChanges.md) |  | [optional] 
**Meters** | Pointer to [**MeterChanges**](MeterChanges.md) |  | [optional] 
**Prices** | Pointer to [**PriceChanges**](PriceChanges.md) |  | [optional] 
**Products** | Pointer to [**ProductChanges**](ProductChanges.md) |  | [optional] 
**PromotionCodes** | Pointer to [**PromotionCodeChanges**](PromotionCodeChanges.md) |  | [optional] 
**Webhooks** | Pointer to [**WebhookChanges**](WebhookChanges.md) |  | [optional] 

## Methods

### NewConfigChanges

`func NewConfigChanges() *ConfigChanges`

NewConfigChanges instantiates a new ConfigChanges object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewConfigChangesWithDefaults

`func NewConfigChangesWithDefaults() *ConfigChanges`

NewConfigChangesWithDefaults instantiates a new ConfigChanges object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCoupons

`func (o *ConfigChanges) GetCoupons() CouponChanges`

GetCoupons returns the Coupons field if non-nil, zero value otherwise.

### GetCouponsOk

`func (o *ConfigChanges) GetCouponsOk() (*CouponChanges, bool)`

GetCouponsOk returns a tuple with the Coupons field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCoupons

`func (o *ConfigChanges) SetCoupons(v CouponChanges)`

SetCoupons sets Coupons field to given value.

### HasCoupons

`func (o *ConfigChanges) HasCoupons() bool`

HasCoupons returns a boolean if a field has been set.

### GetMeters

`func (o *ConfigChanges) GetMeters() MeterChanges`

GetMeters returns the Meters field if non-nil, zero value otherwise.

### GetMetersOk

`func (o *ConfigChanges) GetMetersOk() (*MeterChanges, bool)`

GetMetersOk returns a tuple with the Meters field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMeters

`func (o *ConfigChanges) SetMeters(v MeterChanges)`

SetMeters sets Meters field to given value.

### HasMeters

`func (o *ConfigChanges) HasMeters() bool`

HasMeters returns a boolean if a field has been set.

### GetPrices

`func (o *ConfigChanges) GetPrices() PriceChanges`

GetPrices returns the Prices field if non-nil, zero value otherwise.

### GetPricesOk

`func (o *ConfigChanges) GetPricesOk() (*PriceChanges, bool)`

GetPricesOk returns a tuple with the Prices field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPrices

`func (o *ConfigChanges) SetPrices(v PriceChanges)`

SetPrices sets Prices field to given value.

### HasPrices

`func (o *ConfigChanges) HasPrices() bool`

HasPrices returns a boolean if a field has been set.

### GetProducts

`func (o *ConfigChanges) GetProducts() ProductChanges`

GetProducts returns the Products field if non-nil, zero value otherwise.

### GetProductsOk

`func (o *ConfigChanges) GetProductsOk() (*ProductChanges, bool)`

GetProductsOk returns a tuple with the Products field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProducts

`func (o *ConfigChanges) SetProducts(v ProductChanges)`

SetProducts sets Products field to given value.

### HasProducts

`func (o *ConfigChanges) HasProducts() bool`

HasProducts returns a boolean if a field has been set.

### GetPromotionCodes

`func (o *ConfigChanges) GetPromotionCodes() PromotionCodeChanges`

GetPromotionCodes returns the PromotionCodes field if non-nil, zero value otherwise.

### GetPromotionCodesOk

`func (o *ConfigChanges) GetPromotionCodesOk() (*PromotionCodeChanges, bool)`

GetPromotionCodesOk returns a tuple with the PromotionCodes field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPromotionCodes

`func (o *ConfigChanges) SetPromotionCodes(v PromotionCodeChanges)`

SetPromotionCodes sets PromotionCodes field to given value.

### HasPromotionCodes

`func (o *ConfigChanges) HasPromotionCodes() bool`

HasPromotionCodes returns a boolean if a field has been set.

### GetWebhooks

`func (o *ConfigChanges) GetWebhooks() WebhookChanges`

GetWebhooks returns the Webhooks field if non-nil, zero value otherwise.

### GetWebhooksOk

`func (o *ConfigChanges) GetWebhooksOk() (*WebhookChanges, bool)`

GetWebhooksOk returns a tuple with the Webhooks field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhooks

`func (o *ConfigChanges) SetWebhooks(v WebhookChanges)`

SetWebhooks sets Webhooks field to given value.

### HasWebhooks

`func (o *ConfigChanges) HasWebhooks() bool`

HasWebhooks returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


