# StripeConfigChanges

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Products** | Pointer to [**ProductChanges**](ProductChanges.md) |  | [optional] 
**Prices** | Pointer to [**PriceChanges**](PriceChanges.md) |  | [optional] 
**Meters** | Pointer to [**MeterChanges**](MeterChanges.md) |  | [optional] 
**Webhooks** | Pointer to [**WebhookChanges**](WebhookChanges.md) |  | [optional] 
**Coupons** | Pointer to [**CouponChanges**](CouponChanges.md) |  | [optional] 
**PromotionCodes** | Pointer to [**PromotionCodeChanges**](PromotionCodeChanges.md) |  | [optional] 

## Methods

### NewStripeConfigChanges

`func NewStripeConfigChanges() *StripeConfigChanges`

NewStripeConfigChanges instantiates a new StripeConfigChanges object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewStripeConfigChangesWithDefaults

`func NewStripeConfigChangesWithDefaults() *StripeConfigChanges`

NewStripeConfigChangesWithDefaults instantiates a new StripeConfigChanges object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetProducts

`func (o *StripeConfigChanges) GetProducts() ProductChanges`

GetProducts returns the Products field if non-nil, zero value otherwise.

### GetProductsOk

`func (o *StripeConfigChanges) GetProductsOk() (*ProductChanges, bool)`

GetProductsOk returns a tuple with the Products field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProducts

`func (o *StripeConfigChanges) SetProducts(v ProductChanges)`

SetProducts sets Products field to given value.

### HasProducts

`func (o *StripeConfigChanges) HasProducts() bool`

HasProducts returns a boolean if a field has been set.

### GetPrices

`func (o *StripeConfigChanges) GetPrices() PriceChanges`

GetPrices returns the Prices field if non-nil, zero value otherwise.

### GetPricesOk

`func (o *StripeConfigChanges) GetPricesOk() (*PriceChanges, bool)`

GetPricesOk returns a tuple with the Prices field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPrices

`func (o *StripeConfigChanges) SetPrices(v PriceChanges)`

SetPrices sets Prices field to given value.

### HasPrices

`func (o *StripeConfigChanges) HasPrices() bool`

HasPrices returns a boolean if a field has been set.

### GetMeters

`func (o *StripeConfigChanges) GetMeters() MeterChanges`

GetMeters returns the Meters field if non-nil, zero value otherwise.

### GetMetersOk

`func (o *StripeConfigChanges) GetMetersOk() (*MeterChanges, bool)`

GetMetersOk returns a tuple with the Meters field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMeters

`func (o *StripeConfigChanges) SetMeters(v MeterChanges)`

SetMeters sets Meters field to given value.

### HasMeters

`func (o *StripeConfigChanges) HasMeters() bool`

HasMeters returns a boolean if a field has been set.

### GetWebhooks

`func (o *StripeConfigChanges) GetWebhooks() WebhookChanges`

GetWebhooks returns the Webhooks field if non-nil, zero value otherwise.

### GetWebhooksOk

`func (o *StripeConfigChanges) GetWebhooksOk() (*WebhookChanges, bool)`

GetWebhooksOk returns a tuple with the Webhooks field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhooks

`func (o *StripeConfigChanges) SetWebhooks(v WebhookChanges)`

SetWebhooks sets Webhooks field to given value.

### HasWebhooks

`func (o *StripeConfigChanges) HasWebhooks() bool`

HasWebhooks returns a boolean if a field has been set.

### GetCoupons

`func (o *StripeConfigChanges) GetCoupons() CouponChanges`

GetCoupons returns the Coupons field if non-nil, zero value otherwise.

### GetCouponsOk

`func (o *StripeConfigChanges) GetCouponsOk() (*CouponChanges, bool)`

GetCouponsOk returns a tuple with the Coupons field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCoupons

`func (o *StripeConfigChanges) SetCoupons(v CouponChanges)`

SetCoupons sets Coupons field to given value.

### HasCoupons

`func (o *StripeConfigChanges) HasCoupons() bool`

HasCoupons returns a boolean if a field has been set.

### GetPromotionCodes

`func (o *StripeConfigChanges) GetPromotionCodes() PromotionCodeChanges`

GetPromotionCodes returns the PromotionCodes field if non-nil, zero value otherwise.

### GetPromotionCodesOk

`func (o *StripeConfigChanges) GetPromotionCodesOk() (*PromotionCodeChanges, bool)`

GetPromotionCodesOk returns a tuple with the PromotionCodes field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPromotionCodes

`func (o *StripeConfigChanges) SetPromotionCodes(v PromotionCodeChanges)`

SetPromotionCodes sets PromotionCodes field to given value.

### HasPromotionCodes

`func (o *StripeConfigChanges) HasPromotionCodes() bool`

HasPromotionCodes returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


