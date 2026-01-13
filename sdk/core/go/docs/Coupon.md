# Coupon

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** | Coupon identifier (config ID) | 
**StripeId** | Pointer to **string** | Original Stripe ID for migration support (optional, used to link existing Stripe coupons) | [optional] 
**Name** | Pointer to **string** | Coupon name (displayed to customers) | [optional] 
**PercentOff** | Pointer to **float64** | Percentage discount (0-100). Either percent_off or amount_off must be set, not both. | [optional] 
**AmountOff** | Pointer to **int64** | Fixed amount discount in smallest currency unit. Either percent_off or amount_off must be set, not both. Note that amount_off coupons cannot use &#39;forever&#39; duration (Stripe restriction). | [optional] 
**Currency** | Pointer to **string** | Currency for amount_off (required when amount_off is set) | [optional] 
**Duration** | [**CouponDuration**](CouponDuration.md) |  | 
**DurationInMonths** | Pointer to **int64** | Number of months the discount applies (required when duration is repeating) | [optional] 
**MaxRedemptions** | Pointer to **int64** | Maximum number of times this coupon can be redeemed | [optional] 
**RedeemBy** | Pointer to **int64** | Unix timestamp after which the coupon can no longer be redeemed | [optional] 
**AppliesTo** | Pointer to **[]string** | List of product IDs this coupon applies to (empty &#x3D; all products) | [optional] 
**Metadata** | Pointer to **map[string]string** | Custom metadata for the coupon | [optional] 

## Methods

### NewCoupon

`func NewCoupon(id string, duration CouponDuration, ) *Coupon`

NewCoupon instantiates a new Coupon object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCouponWithDefaults

`func NewCouponWithDefaults() *Coupon`

NewCouponWithDefaults instantiates a new Coupon object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *Coupon) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *Coupon) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *Coupon) SetId(v string)`

SetId sets Id field to given value.


### GetStripeId

`func (o *Coupon) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *Coupon) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *Coupon) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *Coupon) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.

### GetName

`func (o *Coupon) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *Coupon) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *Coupon) SetName(v string)`

SetName sets Name field to given value.

### HasName

`func (o *Coupon) HasName() bool`

HasName returns a boolean if a field has been set.

### GetPercentOff

`func (o *Coupon) GetPercentOff() float64`

GetPercentOff returns the PercentOff field if non-nil, zero value otherwise.

### GetPercentOffOk

`func (o *Coupon) GetPercentOffOk() (*float64, bool)`

GetPercentOffOk returns a tuple with the PercentOff field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPercentOff

`func (o *Coupon) SetPercentOff(v float64)`

SetPercentOff sets PercentOff field to given value.

### HasPercentOff

`func (o *Coupon) HasPercentOff() bool`

HasPercentOff returns a boolean if a field has been set.

### GetAmountOff

`func (o *Coupon) GetAmountOff() int64`

GetAmountOff returns the AmountOff field if non-nil, zero value otherwise.

### GetAmountOffOk

`func (o *Coupon) GetAmountOffOk() (*int64, bool)`

GetAmountOffOk returns a tuple with the AmountOff field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAmountOff

`func (o *Coupon) SetAmountOff(v int64)`

SetAmountOff sets AmountOff field to given value.

### HasAmountOff

`func (o *Coupon) HasAmountOff() bool`

HasAmountOff returns a boolean if a field has been set.

### GetCurrency

`func (o *Coupon) GetCurrency() string`

GetCurrency returns the Currency field if non-nil, zero value otherwise.

### GetCurrencyOk

`func (o *Coupon) GetCurrencyOk() (*string, bool)`

GetCurrencyOk returns a tuple with the Currency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrency

`func (o *Coupon) SetCurrency(v string)`

SetCurrency sets Currency field to given value.

### HasCurrency

`func (o *Coupon) HasCurrency() bool`

HasCurrency returns a boolean if a field has been set.

### GetDuration

`func (o *Coupon) GetDuration() CouponDuration`

GetDuration returns the Duration field if non-nil, zero value otherwise.

### GetDurationOk

`func (o *Coupon) GetDurationOk() (*CouponDuration, bool)`

GetDurationOk returns a tuple with the Duration field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDuration

`func (o *Coupon) SetDuration(v CouponDuration)`

SetDuration sets Duration field to given value.


### GetDurationInMonths

`func (o *Coupon) GetDurationInMonths() int64`

GetDurationInMonths returns the DurationInMonths field if non-nil, zero value otherwise.

### GetDurationInMonthsOk

`func (o *Coupon) GetDurationInMonthsOk() (*int64, bool)`

GetDurationInMonthsOk returns a tuple with the DurationInMonths field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDurationInMonths

`func (o *Coupon) SetDurationInMonths(v int64)`

SetDurationInMonths sets DurationInMonths field to given value.

### HasDurationInMonths

`func (o *Coupon) HasDurationInMonths() bool`

HasDurationInMonths returns a boolean if a field has been set.

### GetMaxRedemptions

`func (o *Coupon) GetMaxRedemptions() int64`

GetMaxRedemptions returns the MaxRedemptions field if non-nil, zero value otherwise.

### GetMaxRedemptionsOk

`func (o *Coupon) GetMaxRedemptionsOk() (*int64, bool)`

GetMaxRedemptionsOk returns a tuple with the MaxRedemptions field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMaxRedemptions

`func (o *Coupon) SetMaxRedemptions(v int64)`

SetMaxRedemptions sets MaxRedemptions field to given value.

### HasMaxRedemptions

`func (o *Coupon) HasMaxRedemptions() bool`

HasMaxRedemptions returns a boolean if a field has been set.

### GetRedeemBy

`func (o *Coupon) GetRedeemBy() int64`

GetRedeemBy returns the RedeemBy field if non-nil, zero value otherwise.

### GetRedeemByOk

`func (o *Coupon) GetRedeemByOk() (*int64, bool)`

GetRedeemByOk returns a tuple with the RedeemBy field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRedeemBy

`func (o *Coupon) SetRedeemBy(v int64)`

SetRedeemBy sets RedeemBy field to given value.

### HasRedeemBy

`func (o *Coupon) HasRedeemBy() bool`

HasRedeemBy returns a boolean if a field has been set.

### GetAppliesTo

`func (o *Coupon) GetAppliesTo() []string`

GetAppliesTo returns the AppliesTo field if non-nil, zero value otherwise.

### GetAppliesToOk

`func (o *Coupon) GetAppliesToOk() (*[]string, bool)`

GetAppliesToOk returns a tuple with the AppliesTo field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAppliesTo

`func (o *Coupon) SetAppliesTo(v []string)`

SetAppliesTo sets AppliesTo field to given value.

### HasAppliesTo

`func (o *Coupon) HasAppliesTo() bool`

HasAppliesTo returns a boolean if a field has been set.

### GetMetadata

`func (o *Coupon) GetMetadata() map[string]string`

GetMetadata returns the Metadata field if non-nil, zero value otherwise.

### GetMetadataOk

`func (o *Coupon) GetMetadataOk() (*map[string]string, bool)`

GetMetadataOk returns a tuple with the Metadata field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMetadata

`func (o *Coupon) SetMetadata(v map[string]string)`

SetMetadata sets Metadata field to given value.

### HasMetadata

`func (o *Coupon) HasMetadata() bool`

HasMetadata returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


