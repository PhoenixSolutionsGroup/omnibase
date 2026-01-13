# PromotionCodeWithStripeID

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** | Promotion code identifier (config ID) | 
**Code** | **string** | Customer-facing promotion code | 
**Coupon** | **string** | Reference to coupon ID | 
**Active** | Pointer to **bool** | Whether the promotion code is active | [optional] 
**MaxRedemptions** | Pointer to **int64** | Maximum redemptions | [optional] 
**FirstTimeTransaction** | Pointer to **bool** | First-time customers only | [optional] 
**MinimumAmount** | Pointer to **int64** | Minimum order amount | [optional] 
**MinimumAmountCurrency** | Pointer to **string** | Currency for minimum_amount | [optional] 
**ExpiresAt** | Pointer to **int64** | Expiration timestamp | [optional] 
**Metadata** | Pointer to **map[string]string** |  | [optional] 
**StripeId** | Pointer to **string** | Actual Stripe promotion code ID | [optional] 

## Methods

### NewPromotionCodeWithStripeID

`func NewPromotionCodeWithStripeID(id string, code string, coupon string, ) *PromotionCodeWithStripeID`

NewPromotionCodeWithStripeID instantiates a new PromotionCodeWithStripeID object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewPromotionCodeWithStripeIDWithDefaults

`func NewPromotionCodeWithStripeIDWithDefaults() *PromotionCodeWithStripeID`

NewPromotionCodeWithStripeIDWithDefaults instantiates a new PromotionCodeWithStripeID object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *PromotionCodeWithStripeID) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *PromotionCodeWithStripeID) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *PromotionCodeWithStripeID) SetId(v string)`

SetId sets Id field to given value.


### GetCode

`func (o *PromotionCodeWithStripeID) GetCode() string`

GetCode returns the Code field if non-nil, zero value otherwise.

### GetCodeOk

`func (o *PromotionCodeWithStripeID) GetCodeOk() (*string, bool)`

GetCodeOk returns a tuple with the Code field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCode

`func (o *PromotionCodeWithStripeID) SetCode(v string)`

SetCode sets Code field to given value.


### GetCoupon

`func (o *PromotionCodeWithStripeID) GetCoupon() string`

GetCoupon returns the Coupon field if non-nil, zero value otherwise.

### GetCouponOk

`func (o *PromotionCodeWithStripeID) GetCouponOk() (*string, bool)`

GetCouponOk returns a tuple with the Coupon field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCoupon

`func (o *PromotionCodeWithStripeID) SetCoupon(v string)`

SetCoupon sets Coupon field to given value.


### GetActive

`func (o *PromotionCodeWithStripeID) GetActive() bool`

GetActive returns the Active field if non-nil, zero value otherwise.

### GetActiveOk

`func (o *PromotionCodeWithStripeID) GetActiveOk() (*bool, bool)`

GetActiveOk returns a tuple with the Active field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetActive

`func (o *PromotionCodeWithStripeID) SetActive(v bool)`

SetActive sets Active field to given value.

### HasActive

`func (o *PromotionCodeWithStripeID) HasActive() bool`

HasActive returns a boolean if a field has been set.

### GetMaxRedemptions

`func (o *PromotionCodeWithStripeID) GetMaxRedemptions() int64`

GetMaxRedemptions returns the MaxRedemptions field if non-nil, zero value otherwise.

### GetMaxRedemptionsOk

`func (o *PromotionCodeWithStripeID) GetMaxRedemptionsOk() (*int64, bool)`

GetMaxRedemptionsOk returns a tuple with the MaxRedemptions field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMaxRedemptions

`func (o *PromotionCodeWithStripeID) SetMaxRedemptions(v int64)`

SetMaxRedemptions sets MaxRedemptions field to given value.

### HasMaxRedemptions

`func (o *PromotionCodeWithStripeID) HasMaxRedemptions() bool`

HasMaxRedemptions returns a boolean if a field has been set.

### GetFirstTimeTransaction

`func (o *PromotionCodeWithStripeID) GetFirstTimeTransaction() bool`

GetFirstTimeTransaction returns the FirstTimeTransaction field if non-nil, zero value otherwise.

### GetFirstTimeTransactionOk

`func (o *PromotionCodeWithStripeID) GetFirstTimeTransactionOk() (*bool, bool)`

GetFirstTimeTransactionOk returns a tuple with the FirstTimeTransaction field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFirstTimeTransaction

`func (o *PromotionCodeWithStripeID) SetFirstTimeTransaction(v bool)`

SetFirstTimeTransaction sets FirstTimeTransaction field to given value.

### HasFirstTimeTransaction

`func (o *PromotionCodeWithStripeID) HasFirstTimeTransaction() bool`

HasFirstTimeTransaction returns a boolean if a field has been set.

### GetMinimumAmount

`func (o *PromotionCodeWithStripeID) GetMinimumAmount() int64`

GetMinimumAmount returns the MinimumAmount field if non-nil, zero value otherwise.

### GetMinimumAmountOk

`func (o *PromotionCodeWithStripeID) GetMinimumAmountOk() (*int64, bool)`

GetMinimumAmountOk returns a tuple with the MinimumAmount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMinimumAmount

`func (o *PromotionCodeWithStripeID) SetMinimumAmount(v int64)`

SetMinimumAmount sets MinimumAmount field to given value.

### HasMinimumAmount

`func (o *PromotionCodeWithStripeID) HasMinimumAmount() bool`

HasMinimumAmount returns a boolean if a field has been set.

### GetMinimumAmountCurrency

`func (o *PromotionCodeWithStripeID) GetMinimumAmountCurrency() string`

GetMinimumAmountCurrency returns the MinimumAmountCurrency field if non-nil, zero value otherwise.

### GetMinimumAmountCurrencyOk

`func (o *PromotionCodeWithStripeID) GetMinimumAmountCurrencyOk() (*string, bool)`

GetMinimumAmountCurrencyOk returns a tuple with the MinimumAmountCurrency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMinimumAmountCurrency

`func (o *PromotionCodeWithStripeID) SetMinimumAmountCurrency(v string)`

SetMinimumAmountCurrency sets MinimumAmountCurrency field to given value.

### HasMinimumAmountCurrency

`func (o *PromotionCodeWithStripeID) HasMinimumAmountCurrency() bool`

HasMinimumAmountCurrency returns a boolean if a field has been set.

### GetExpiresAt

`func (o *PromotionCodeWithStripeID) GetExpiresAt() int64`

GetExpiresAt returns the ExpiresAt field if non-nil, zero value otherwise.

### GetExpiresAtOk

`func (o *PromotionCodeWithStripeID) GetExpiresAtOk() (*int64, bool)`

GetExpiresAtOk returns a tuple with the ExpiresAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetExpiresAt

`func (o *PromotionCodeWithStripeID) SetExpiresAt(v int64)`

SetExpiresAt sets ExpiresAt field to given value.

### HasExpiresAt

`func (o *PromotionCodeWithStripeID) HasExpiresAt() bool`

HasExpiresAt returns a boolean if a field has been set.

### GetMetadata

`func (o *PromotionCodeWithStripeID) GetMetadata() map[string]string`

GetMetadata returns the Metadata field if non-nil, zero value otherwise.

### GetMetadataOk

`func (o *PromotionCodeWithStripeID) GetMetadataOk() (*map[string]string, bool)`

GetMetadataOk returns a tuple with the Metadata field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMetadata

`func (o *PromotionCodeWithStripeID) SetMetadata(v map[string]string)`

SetMetadata sets Metadata field to given value.

### HasMetadata

`func (o *PromotionCodeWithStripeID) HasMetadata() bool`

HasMetadata returns a boolean if a field has been set.

### GetStripeId

`func (o *PromotionCodeWithStripeID) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *PromotionCodeWithStripeID) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *PromotionCodeWithStripeID) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *PromotionCodeWithStripeID) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


