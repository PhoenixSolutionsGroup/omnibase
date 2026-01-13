# WebhookChanges

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Created** | Pointer to [**[]WebhookChange**](WebhookChange.md) | Webhooks that were created in Stripe | [optional] 
**Updated** | Pointer to [**[]WebhookChange**](WebhookChange.md) | Webhooks that were updated | [optional] 
**Unchanged** | Pointer to [**[]WebhookChange**](WebhookChange.md) | Webhooks that were unchanged | [optional] 

## Methods

### NewWebhookChanges

`func NewWebhookChanges() *WebhookChanges`

NewWebhookChanges instantiates a new WebhookChanges object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewWebhookChangesWithDefaults

`func NewWebhookChangesWithDefaults() *WebhookChanges`

NewWebhookChangesWithDefaults instantiates a new WebhookChanges object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCreated

`func (o *WebhookChanges) GetCreated() []WebhookChange`

GetCreated returns the Created field if non-nil, zero value otherwise.

### GetCreatedOk

`func (o *WebhookChanges) GetCreatedOk() (*[]WebhookChange, bool)`

GetCreatedOk returns a tuple with the Created field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreated

`func (o *WebhookChanges) SetCreated(v []WebhookChange)`

SetCreated sets Created field to given value.

### HasCreated

`func (o *WebhookChanges) HasCreated() bool`

HasCreated returns a boolean if a field has been set.

### GetUpdated

`func (o *WebhookChanges) GetUpdated() []WebhookChange`

GetUpdated returns the Updated field if non-nil, zero value otherwise.

### GetUpdatedOk

`func (o *WebhookChanges) GetUpdatedOk() (*[]WebhookChange, bool)`

GetUpdatedOk returns a tuple with the Updated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdated

`func (o *WebhookChanges) SetUpdated(v []WebhookChange)`

SetUpdated sets Updated field to given value.

### HasUpdated

`func (o *WebhookChanges) HasUpdated() bool`

HasUpdated returns a boolean if a field has been set.

### GetUnchanged

`func (o *WebhookChanges) GetUnchanged() []WebhookChange`

GetUnchanged returns the Unchanged field if non-nil, zero value otherwise.

### GetUnchangedOk

`func (o *WebhookChanges) GetUnchangedOk() (*[]WebhookChange, bool)`

GetUnchangedOk returns a tuple with the Unchanged field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUnchanged

`func (o *WebhookChanges) SetUnchanged(v []WebhookChange)`

SetUnchanged sets Unchanged field to given value.

### HasUnchanged

`func (o *WebhookChanges) HasUnchanged() bool`

HasUnchanged returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


