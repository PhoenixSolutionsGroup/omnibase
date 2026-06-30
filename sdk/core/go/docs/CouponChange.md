# CouponChange

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Action** | **string** |  | 
**CouponId** | **string** |  | 
**Name** | **string** |  | 
**StripeId** | Pointer to **string** |  | [optional] 

## Methods

### NewCouponChange

`func NewCouponChange(action string, couponId string, name string, ) *CouponChange`

NewCouponChange instantiates a new CouponChange object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCouponChangeWithDefaults

`func NewCouponChangeWithDefaults() *CouponChange`

NewCouponChangeWithDefaults instantiates a new CouponChange object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAction

`func (o *CouponChange) GetAction() string`

GetAction returns the Action field if non-nil, zero value otherwise.

### GetActionOk

`func (o *CouponChange) GetActionOk() (*string, bool)`

GetActionOk returns a tuple with the Action field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAction

`func (o *CouponChange) SetAction(v string)`

SetAction sets Action field to given value.


### GetCouponId

`func (o *CouponChange) GetCouponId() string`

GetCouponId returns the CouponId field if non-nil, zero value otherwise.

### GetCouponIdOk

`func (o *CouponChange) GetCouponIdOk() (*string, bool)`

GetCouponIdOk returns a tuple with the CouponId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCouponId

`func (o *CouponChange) SetCouponId(v string)`

SetCouponId sets CouponId field to given value.


### GetName

`func (o *CouponChange) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *CouponChange) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *CouponChange) SetName(v string)`

SetName sets Name field to given value.


### GetStripeId

`func (o *CouponChange) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *CouponChange) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *CouponChange) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *CouponChange) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


