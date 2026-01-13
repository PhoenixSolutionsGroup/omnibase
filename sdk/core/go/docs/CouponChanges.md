# CouponChanges

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Created** | Pointer to [**[]CouponChange**](CouponChange.md) | Coupons that were created in Stripe | [optional] 
**Updated** | Pointer to [**[]CouponChange**](CouponChange.md) | Coupons that were updated | [optional] 
**Archived** | Pointer to [**[]CouponChange**](CouponChange.md) | Coupons that were deleted | [optional] 

## Methods

### NewCouponChanges

`func NewCouponChanges() *CouponChanges`

NewCouponChanges instantiates a new CouponChanges object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCouponChangesWithDefaults

`func NewCouponChangesWithDefaults() *CouponChanges`

NewCouponChangesWithDefaults instantiates a new CouponChanges object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCreated

`func (o *CouponChanges) GetCreated() []CouponChange`

GetCreated returns the Created field if non-nil, zero value otherwise.

### GetCreatedOk

`func (o *CouponChanges) GetCreatedOk() (*[]CouponChange, bool)`

GetCreatedOk returns a tuple with the Created field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreated

`func (o *CouponChanges) SetCreated(v []CouponChange)`

SetCreated sets Created field to given value.

### HasCreated

`func (o *CouponChanges) HasCreated() bool`

HasCreated returns a boolean if a field has been set.

### GetUpdated

`func (o *CouponChanges) GetUpdated() []CouponChange`

GetUpdated returns the Updated field if non-nil, zero value otherwise.

### GetUpdatedOk

`func (o *CouponChanges) GetUpdatedOk() (*[]CouponChange, bool)`

GetUpdatedOk returns a tuple with the Updated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdated

`func (o *CouponChanges) SetUpdated(v []CouponChange)`

SetUpdated sets Updated field to given value.

### HasUpdated

`func (o *CouponChanges) HasUpdated() bool`

HasUpdated returns a boolean if a field has been set.

### GetArchived

`func (o *CouponChanges) GetArchived() []CouponChange`

GetArchived returns the Archived field if non-nil, zero value otherwise.

### GetArchivedOk

`func (o *CouponChanges) GetArchivedOk() (*[]CouponChange, bool)`

GetArchivedOk returns a tuple with the Archived field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetArchived

`func (o *CouponChanges) SetArchived(v []CouponChange)`

SetArchived sets Archived field to given value.

### HasArchived

`func (o *CouponChanges) HasArchived() bool`

HasArchived returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


