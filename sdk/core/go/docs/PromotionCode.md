# PromotionCode

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** | Promotion code identifier (config ID) | 
**StripeId** | Pointer to **string** | Original Stripe ID for migration support | [optional] 
**Code** | **string** | Customer-facing promotion code | 
**Coupon** | **string** | Reference to coupon ID this promotion code applies | 
**Active** | Pointer to **bool** | Whether the promotion code is active (default true) | [optional] 
**MaxRedemptions** | Pointer to **int64** | Maximum number of times this code can be redeemed | [optional] 
**FirstTimeTransaction** | Pointer to **bool** | Restrict to first-time customers only | [optional] 
**MinimumAmount** | Pointer to **int64** | Minimum order amount required (in smallest currency unit) | [optional] 
**MinimumAmountCurrency** | Pointer to **string** | Currency for minimum_amount | [optional] 
**ExpiresAt** | Pointer to **int64** | Unix timestamp when the promotion code expires | [optional] 
**Metadata** | Pointer to **map[string]string** | Custom metadata for the promotion code | [optional] 

## Methods

### NewPromotionCode

`func NewPromotionCode(id string, code string, coupon string, ) *PromotionCode`

NewPromotionCode instantiates a new PromotionCode object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewPromotionCodeWithDefaults

`func NewPromotionCodeWithDefaults() *PromotionCode`

NewPromotionCodeWithDefaults instantiates a new PromotionCode object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *PromotionCode) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *PromotionCode) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *PromotionCode) SetId(v string)`

SetId sets Id field to given value.


### GetStripeId

`func (o *PromotionCode) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *PromotionCode) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *PromotionCode) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *PromotionCode) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.

### GetCode

`func (o *PromotionCode) GetCode() string`

GetCode returns the Code field if non-nil, zero value otherwise.

### GetCodeOk

`func (o *PromotionCode) GetCodeOk() (*string, bool)`

GetCodeOk returns a tuple with the Code field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCode

`func (o *PromotionCode) SetCode(v string)`

SetCode sets Code field to given value.


### GetCoupon

`func (o *PromotionCode) GetCoupon() string`

GetCoupon returns the Coupon field if non-nil, zero value otherwise.

### GetCouponOk

`func (o *PromotionCode) GetCouponOk() (*string, bool)`

GetCouponOk returns a tuple with the Coupon field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCoupon

`func (o *PromotionCode) SetCoupon(v string)`

SetCoupon sets Coupon field to given value.


### GetActive

`func (o *PromotionCode) GetActive() bool`

GetActive returns the Active field if non-nil, zero value otherwise.

### GetActiveOk

`func (o *PromotionCode) GetActiveOk() (*bool, bool)`

GetActiveOk returns a tuple with the Active field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetActive

`func (o *PromotionCode) SetActive(v bool)`

SetActive sets Active field to given value.

### HasActive

`func (o *PromotionCode) HasActive() bool`

HasActive returns a boolean if a field has been set.

### GetMaxRedemptions

`func (o *PromotionCode) GetMaxRedemptions() int64`

GetMaxRedemptions returns the MaxRedemptions field if non-nil, zero value otherwise.

### GetMaxRedemptionsOk

`func (o *PromotionCode) GetMaxRedemptionsOk() (*int64, bool)`

GetMaxRedemptionsOk returns a tuple with the MaxRedemptions field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMaxRedemptions

`func (o *PromotionCode) SetMaxRedemptions(v int64)`

SetMaxRedemptions sets MaxRedemptions field to given value.

### HasMaxRedemptions

`func (o *PromotionCode) HasMaxRedemptions() bool`

HasMaxRedemptions returns a boolean if a field has been set.

### GetFirstTimeTransaction

`func (o *PromotionCode) GetFirstTimeTransaction() bool`

GetFirstTimeTransaction returns the FirstTimeTransaction field if non-nil, zero value otherwise.

### GetFirstTimeTransactionOk

`func (o *PromotionCode) GetFirstTimeTransactionOk() (*bool, bool)`

GetFirstTimeTransactionOk returns a tuple with the FirstTimeTransaction field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFirstTimeTransaction

`func (o *PromotionCode) SetFirstTimeTransaction(v bool)`

SetFirstTimeTransaction sets FirstTimeTransaction field to given value.

### HasFirstTimeTransaction

`func (o *PromotionCode) HasFirstTimeTransaction() bool`

HasFirstTimeTransaction returns a boolean if a field has been set.

### GetMinimumAmount

`func (o *PromotionCode) GetMinimumAmount() int64`

GetMinimumAmount returns the MinimumAmount field if non-nil, zero value otherwise.

### GetMinimumAmountOk

`func (o *PromotionCode) GetMinimumAmountOk() (*int64, bool)`

GetMinimumAmountOk returns a tuple with the MinimumAmount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMinimumAmount

`func (o *PromotionCode) SetMinimumAmount(v int64)`

SetMinimumAmount sets MinimumAmount field to given value.

### HasMinimumAmount

`func (o *PromotionCode) HasMinimumAmount() bool`

HasMinimumAmount returns a boolean if a field has been set.

### GetMinimumAmountCurrency

`func (o *PromotionCode) GetMinimumAmountCurrency() string`

GetMinimumAmountCurrency returns the MinimumAmountCurrency field if non-nil, zero value otherwise.

### GetMinimumAmountCurrencyOk

`func (o *PromotionCode) GetMinimumAmountCurrencyOk() (*string, bool)`

GetMinimumAmountCurrencyOk returns a tuple with the MinimumAmountCurrency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMinimumAmountCurrency

`func (o *PromotionCode) SetMinimumAmountCurrency(v string)`

SetMinimumAmountCurrency sets MinimumAmountCurrency field to given value.

### HasMinimumAmountCurrency

`func (o *PromotionCode) HasMinimumAmountCurrency() bool`

HasMinimumAmountCurrency returns a boolean if a field has been set.

### GetExpiresAt

`func (o *PromotionCode) GetExpiresAt() int64`

GetExpiresAt returns the ExpiresAt field if non-nil, zero value otherwise.

### GetExpiresAtOk

`func (o *PromotionCode) GetExpiresAtOk() (*int64, bool)`

GetExpiresAtOk returns a tuple with the ExpiresAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetExpiresAt

`func (o *PromotionCode) SetExpiresAt(v int64)`

SetExpiresAt sets ExpiresAt field to given value.

### HasExpiresAt

`func (o *PromotionCode) HasExpiresAt() bool`

HasExpiresAt returns a boolean if a field has been set.

### GetMetadata

`func (o *PromotionCode) GetMetadata() map[string]string`

GetMetadata returns the Metadata field if non-nil, zero value otherwise.

### GetMetadataOk

`func (o *PromotionCode) GetMetadataOk() (*map[string]string, bool)`

GetMetadataOk returns a tuple with the Metadata field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMetadata

`func (o *PromotionCode) SetMetadata(v map[string]string)`

SetMetadata sets Metadata field to given value.

### HasMetadata

`func (o *PromotionCode) HasMetadata() bool`

HasMetadata returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


