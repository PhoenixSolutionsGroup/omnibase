# PriceChanges

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Created** | Pointer to [**[]PriceChange**](PriceChange.md) | Prices that were created in Stripe | [optional] 
**Updated** | Pointer to [**[]PriceChange**](PriceChange.md) | Prices that were updated in Stripe | [optional] 
**Archived** | Pointer to [**[]PriceChange**](PriceChange.md) | Prices that were archived in Stripe | [optional] 

## Methods

### NewPriceChanges

`func NewPriceChanges() *PriceChanges`

NewPriceChanges instantiates a new PriceChanges object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewPriceChangesWithDefaults

`func NewPriceChangesWithDefaults() *PriceChanges`

NewPriceChangesWithDefaults instantiates a new PriceChanges object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCreated

`func (o *PriceChanges) GetCreated() []PriceChange`

GetCreated returns the Created field if non-nil, zero value otherwise.

### GetCreatedOk

`func (o *PriceChanges) GetCreatedOk() (*[]PriceChange, bool)`

GetCreatedOk returns a tuple with the Created field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreated

`func (o *PriceChanges) SetCreated(v []PriceChange)`

SetCreated sets Created field to given value.

### HasCreated

`func (o *PriceChanges) HasCreated() bool`

HasCreated returns a boolean if a field has been set.

### GetUpdated

`func (o *PriceChanges) GetUpdated() []PriceChange`

GetUpdated returns the Updated field if non-nil, zero value otherwise.

### GetUpdatedOk

`func (o *PriceChanges) GetUpdatedOk() (*[]PriceChange, bool)`

GetUpdatedOk returns a tuple with the Updated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdated

`func (o *PriceChanges) SetUpdated(v []PriceChange)`

SetUpdated sets Updated field to given value.

### HasUpdated

`func (o *PriceChanges) HasUpdated() bool`

HasUpdated returns a boolean if a field has been set.

### GetArchived

`func (o *PriceChanges) GetArchived() []PriceChange`

GetArchived returns the Archived field if non-nil, zero value otherwise.

### GetArchivedOk

`func (o *PriceChanges) GetArchivedOk() (*[]PriceChange, bool)`

GetArchivedOk returns a tuple with the Archived field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetArchived

`func (o *PriceChanges) SetArchived(v []PriceChange)`

SetArchived sets Archived field to given value.

### HasArchived

`func (o *PriceChanges) HasArchived() bool`

HasArchived returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


