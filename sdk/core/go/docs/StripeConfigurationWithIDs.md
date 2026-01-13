# StripeConfigurationWithIDs

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Version** | **string** | Configuration version | 
**Webhooks** | Pointer to [**[]WebhookEndpointConfig**](WebhookEndpointConfig.md) | List of webhook endpoint configurations | [optional] 
**Meters** | Pointer to [**[]MeterWithStripeID**](MeterWithStripeID.md) | List of billing meters with Stripe IDs | [optional] 
**Products** | [**[]ProductWithStripeIDs**](ProductWithStripeIDs.md) | List of products with Stripe IDs | 
**Coupons** | Pointer to [**[]CouponWithStripeID**](CouponWithStripeID.md) | List of coupons with Stripe IDs | [optional] 
**PromotionCodes** | Pointer to [**[]PromotionCodeWithStripeID**](PromotionCodeWithStripeID.md) | List of promotion codes with Stripe IDs | [optional] 

## Methods

### NewStripeConfigurationWithIDs

`func NewStripeConfigurationWithIDs(version string, products []ProductWithStripeIDs, ) *StripeConfigurationWithIDs`

NewStripeConfigurationWithIDs instantiates a new StripeConfigurationWithIDs object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewStripeConfigurationWithIDsWithDefaults

`func NewStripeConfigurationWithIDsWithDefaults() *StripeConfigurationWithIDs`

NewStripeConfigurationWithIDsWithDefaults instantiates a new StripeConfigurationWithIDs object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetVersion

`func (o *StripeConfigurationWithIDs) GetVersion() string`

GetVersion returns the Version field if non-nil, zero value otherwise.

### GetVersionOk

`func (o *StripeConfigurationWithIDs) GetVersionOk() (*string, bool)`

GetVersionOk returns a tuple with the Version field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVersion

`func (o *StripeConfigurationWithIDs) SetVersion(v string)`

SetVersion sets Version field to given value.


### GetWebhooks

`func (o *StripeConfigurationWithIDs) GetWebhooks() []WebhookEndpointConfig`

GetWebhooks returns the Webhooks field if non-nil, zero value otherwise.

### GetWebhooksOk

`func (o *StripeConfigurationWithIDs) GetWebhooksOk() (*[]WebhookEndpointConfig, bool)`

GetWebhooksOk returns a tuple with the Webhooks field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhooks

`func (o *StripeConfigurationWithIDs) SetWebhooks(v []WebhookEndpointConfig)`

SetWebhooks sets Webhooks field to given value.

### HasWebhooks

`func (o *StripeConfigurationWithIDs) HasWebhooks() bool`

HasWebhooks returns a boolean if a field has been set.

### GetMeters

`func (o *StripeConfigurationWithIDs) GetMeters() []MeterWithStripeID`

GetMeters returns the Meters field if non-nil, zero value otherwise.

### GetMetersOk

`func (o *StripeConfigurationWithIDs) GetMetersOk() (*[]MeterWithStripeID, bool)`

GetMetersOk returns a tuple with the Meters field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMeters

`func (o *StripeConfigurationWithIDs) SetMeters(v []MeterWithStripeID)`

SetMeters sets Meters field to given value.

### HasMeters

`func (o *StripeConfigurationWithIDs) HasMeters() bool`

HasMeters returns a boolean if a field has been set.

### GetProducts

`func (o *StripeConfigurationWithIDs) GetProducts() []ProductWithStripeIDs`

GetProducts returns the Products field if non-nil, zero value otherwise.

### GetProductsOk

`func (o *StripeConfigurationWithIDs) GetProductsOk() (*[]ProductWithStripeIDs, bool)`

GetProductsOk returns a tuple with the Products field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProducts

`func (o *StripeConfigurationWithIDs) SetProducts(v []ProductWithStripeIDs)`

SetProducts sets Products field to given value.


### GetCoupons

`func (o *StripeConfigurationWithIDs) GetCoupons() []CouponWithStripeID`

GetCoupons returns the Coupons field if non-nil, zero value otherwise.

### GetCouponsOk

`func (o *StripeConfigurationWithIDs) GetCouponsOk() (*[]CouponWithStripeID, bool)`

GetCouponsOk returns a tuple with the Coupons field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCoupons

`func (o *StripeConfigurationWithIDs) SetCoupons(v []CouponWithStripeID)`

SetCoupons sets Coupons field to given value.

### HasCoupons

`func (o *StripeConfigurationWithIDs) HasCoupons() bool`

HasCoupons returns a boolean if a field has been set.

### GetPromotionCodes

`func (o *StripeConfigurationWithIDs) GetPromotionCodes() []PromotionCodeWithStripeID`

GetPromotionCodes returns the PromotionCodes field if non-nil, zero value otherwise.

### GetPromotionCodesOk

`func (o *StripeConfigurationWithIDs) GetPromotionCodesOk() (*[]PromotionCodeWithStripeID, bool)`

GetPromotionCodesOk returns a tuple with the PromotionCodes field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPromotionCodes

`func (o *StripeConfigurationWithIDs) SetPromotionCodes(v []PromotionCodeWithStripeID)`

SetPromotionCodes sets PromotionCodes field to given value.

### HasPromotionCodes

`func (o *StripeConfigurationWithIDs) HasPromotionCodes() bool`

HasPromotionCodes returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


