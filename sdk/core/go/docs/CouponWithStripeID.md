# CouponWithStripeID

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** | Coupon identifier (config ID) | 
**Name** | Pointer to **string** | Coupon name | [optional] 
**PercentOff** | Pointer to **float64** | Percentage discount | [optional] 
**AmountOff** | Pointer to **int64** | Fixed amount discount | [optional] 
**Currency** | Pointer to **string** | Currency for amount_off | [optional] 
**Duration** | [**CouponDuration**](CouponDuration.md) |  | 
**DurationInMonths** | Pointer to **int64** | Number of months for repeating duration | [optional] 
**MaxRedemptions** | Pointer to **int64** | Maximum redemptions | [optional] 
**RedeemBy** | Pointer to **int64** | Redemption deadline | [optional] 
**AppliesTo** | Pointer to **[]string** | Product IDs this coupon applies to | [optional] 
**Metadata** | Pointer to **map[string]string** |  | [optional] 
**StripeId** | Pointer to **string** | Actual Stripe coupon ID | [optional] 

## Methods

### NewCouponWithStripeID

`func NewCouponWithStripeID(id string, duration CouponDuration, ) *CouponWithStripeID`

NewCouponWithStripeID instantiates a new CouponWithStripeID object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCouponWithStripeIDWithDefaults

`func NewCouponWithStripeIDWithDefaults() *CouponWithStripeID`

NewCouponWithStripeIDWithDefaults instantiates a new CouponWithStripeID object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *CouponWithStripeID) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *CouponWithStripeID) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *CouponWithStripeID) SetId(v string)`

SetId sets Id field to given value.


### GetName

`func (o *CouponWithStripeID) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *CouponWithStripeID) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *CouponWithStripeID) SetName(v string)`

SetName sets Name field to given value.

### HasName

`func (o *CouponWithStripeID) HasName() bool`

HasName returns a boolean if a field has been set.

### GetPercentOff

`func (o *CouponWithStripeID) GetPercentOff() float64`

GetPercentOff returns the PercentOff field if non-nil, zero value otherwise.

### GetPercentOffOk

`func (o *CouponWithStripeID) GetPercentOffOk() (*float64, bool)`

GetPercentOffOk returns a tuple with the PercentOff field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPercentOff

`func (o *CouponWithStripeID) SetPercentOff(v float64)`

SetPercentOff sets PercentOff field to given value.

### HasPercentOff

`func (o *CouponWithStripeID) HasPercentOff() bool`

HasPercentOff returns a boolean if a field has been set.

### GetAmountOff

`func (o *CouponWithStripeID) GetAmountOff() int64`

GetAmountOff returns the AmountOff field if non-nil, zero value otherwise.

### GetAmountOffOk

`func (o *CouponWithStripeID) GetAmountOffOk() (*int64, bool)`

GetAmountOffOk returns a tuple with the AmountOff field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAmountOff

`func (o *CouponWithStripeID) SetAmountOff(v int64)`

SetAmountOff sets AmountOff field to given value.

### HasAmountOff

`func (o *CouponWithStripeID) HasAmountOff() bool`

HasAmountOff returns a boolean if a field has been set.

### GetCurrency

`func (o *CouponWithStripeID) GetCurrency() string`

GetCurrency returns the Currency field if non-nil, zero value otherwise.

### GetCurrencyOk

`func (o *CouponWithStripeID) GetCurrencyOk() (*string, bool)`

GetCurrencyOk returns a tuple with the Currency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrency

`func (o *CouponWithStripeID) SetCurrency(v string)`

SetCurrency sets Currency field to given value.

### HasCurrency

`func (o *CouponWithStripeID) HasCurrency() bool`

HasCurrency returns a boolean if a field has been set.

### GetDuration

`func (o *CouponWithStripeID) GetDuration() CouponDuration`

GetDuration returns the Duration field if non-nil, zero value otherwise.

### GetDurationOk

`func (o *CouponWithStripeID) GetDurationOk() (*CouponDuration, bool)`

GetDurationOk returns a tuple with the Duration field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDuration

`func (o *CouponWithStripeID) SetDuration(v CouponDuration)`

SetDuration sets Duration field to given value.


### GetDurationInMonths

`func (o *CouponWithStripeID) GetDurationInMonths() int64`

GetDurationInMonths returns the DurationInMonths field if non-nil, zero value otherwise.

### GetDurationInMonthsOk

`func (o *CouponWithStripeID) GetDurationInMonthsOk() (*int64, bool)`

GetDurationInMonthsOk returns a tuple with the DurationInMonths field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDurationInMonths

`func (o *CouponWithStripeID) SetDurationInMonths(v int64)`

SetDurationInMonths sets DurationInMonths field to given value.

### HasDurationInMonths

`func (o *CouponWithStripeID) HasDurationInMonths() bool`

HasDurationInMonths returns a boolean if a field has been set.

### GetMaxRedemptions

`func (o *CouponWithStripeID) GetMaxRedemptions() int64`

GetMaxRedemptions returns the MaxRedemptions field if non-nil, zero value otherwise.

### GetMaxRedemptionsOk

`func (o *CouponWithStripeID) GetMaxRedemptionsOk() (*int64, bool)`

GetMaxRedemptionsOk returns a tuple with the MaxRedemptions field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMaxRedemptions

`func (o *CouponWithStripeID) SetMaxRedemptions(v int64)`

SetMaxRedemptions sets MaxRedemptions field to given value.

### HasMaxRedemptions

`func (o *CouponWithStripeID) HasMaxRedemptions() bool`

HasMaxRedemptions returns a boolean if a field has been set.

### GetRedeemBy

`func (o *CouponWithStripeID) GetRedeemBy() int64`

GetRedeemBy returns the RedeemBy field if non-nil, zero value otherwise.

### GetRedeemByOk

`func (o *CouponWithStripeID) GetRedeemByOk() (*int64, bool)`

GetRedeemByOk returns a tuple with the RedeemBy field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRedeemBy

`func (o *CouponWithStripeID) SetRedeemBy(v int64)`

SetRedeemBy sets RedeemBy field to given value.

### HasRedeemBy

`func (o *CouponWithStripeID) HasRedeemBy() bool`

HasRedeemBy returns a boolean if a field has been set.

### GetAppliesTo

`func (o *CouponWithStripeID) GetAppliesTo() []string`

GetAppliesTo returns the AppliesTo field if non-nil, zero value otherwise.

### GetAppliesToOk

`func (o *CouponWithStripeID) GetAppliesToOk() (*[]string, bool)`

GetAppliesToOk returns a tuple with the AppliesTo field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAppliesTo

`func (o *CouponWithStripeID) SetAppliesTo(v []string)`

SetAppliesTo sets AppliesTo field to given value.

### HasAppliesTo

`func (o *CouponWithStripeID) HasAppliesTo() bool`

HasAppliesTo returns a boolean if a field has been set.

### GetMetadata

`func (o *CouponWithStripeID) GetMetadata() map[string]string`

GetMetadata returns the Metadata field if non-nil, zero value otherwise.

### GetMetadataOk

`func (o *CouponWithStripeID) GetMetadataOk() (*map[string]string, bool)`

GetMetadataOk returns a tuple with the Metadata field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMetadata

`func (o *CouponWithStripeID) SetMetadata(v map[string]string)`

SetMetadata sets Metadata field to given value.

### HasMetadata

`func (o *CouponWithStripeID) HasMetadata() bool`

HasMetadata returns a boolean if a field has been set.

### GetStripeId

`func (o *CouponWithStripeID) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *CouponWithStripeID) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *CouponWithStripeID) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *CouponWithStripeID) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


