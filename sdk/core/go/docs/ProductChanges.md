# ProductChanges

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Created** | Pointer to [**[]ProductChange**](ProductChange.md) | Products that were created in Stripe | [optional] 
**Updated** | Pointer to [**[]ProductChange**](ProductChange.md) | Products that were updated in Stripe | [optional] 
**Archived** | Pointer to [**[]ProductChange**](ProductChange.md) | Products that were archived in Stripe | [optional] 

## Methods

### NewProductChanges

`func NewProductChanges() *ProductChanges`

NewProductChanges instantiates a new ProductChanges object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewProductChangesWithDefaults

`func NewProductChangesWithDefaults() *ProductChanges`

NewProductChangesWithDefaults instantiates a new ProductChanges object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCreated

`func (o *ProductChanges) GetCreated() []ProductChange`

GetCreated returns the Created field if non-nil, zero value otherwise.

### GetCreatedOk

`func (o *ProductChanges) GetCreatedOk() (*[]ProductChange, bool)`

GetCreatedOk returns a tuple with the Created field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreated

`func (o *ProductChanges) SetCreated(v []ProductChange)`

SetCreated sets Created field to given value.

### HasCreated

`func (o *ProductChanges) HasCreated() bool`

HasCreated returns a boolean if a field has been set.

### GetUpdated

`func (o *ProductChanges) GetUpdated() []ProductChange`

GetUpdated returns the Updated field if non-nil, zero value otherwise.

### GetUpdatedOk

`func (o *ProductChanges) GetUpdatedOk() (*[]ProductChange, bool)`

GetUpdatedOk returns a tuple with the Updated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdated

`func (o *ProductChanges) SetUpdated(v []ProductChange)`

SetUpdated sets Updated field to given value.

### HasUpdated

`func (o *ProductChanges) HasUpdated() bool`

HasUpdated returns a boolean if a field has been set.

### GetArchived

`func (o *ProductChanges) GetArchived() []ProductChange`

GetArchived returns the Archived field if non-nil, zero value otherwise.

### GetArchivedOk

`func (o *ProductChanges) GetArchivedOk() (*[]ProductChange, bool)`

GetArchivedOk returns a tuple with the Archived field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetArchived

`func (o *ProductChanges) SetArchived(v []ProductChange)`

SetArchived sets Archived field to given value.

### HasArchived

`func (o *ProductChanges) HasArchived() bool`

HasArchived returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


