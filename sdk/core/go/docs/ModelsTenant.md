# ModelsTenant

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**CreatedAt** | **string** |  | 
**Id** | **string** |  | 
**Name** | **string** |  | 
**Settings** | Pointer to [**ModelsTenantSettings**](ModelsTenantSettings.md) | Optional joined fields | [optional] 
**StripeCustomerId** | Pointer to **string** | Nullable initially | [optional] 
**Type** | **string** |  | 
**UpdatedAt** | **string** |  | 

## Methods

### NewModelsTenant

`func NewModelsTenant(createdAt string, id string, name string, type_ string, updatedAt string, ) *ModelsTenant`

NewModelsTenant instantiates a new ModelsTenant object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsTenantWithDefaults

`func NewModelsTenantWithDefaults() *ModelsTenant`

NewModelsTenantWithDefaults instantiates a new ModelsTenant object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCreatedAt

`func (o *ModelsTenant) GetCreatedAt() string`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *ModelsTenant) GetCreatedAtOk() (*string, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *ModelsTenant) SetCreatedAt(v string)`

SetCreatedAt sets CreatedAt field to given value.


### GetId

`func (o *ModelsTenant) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ModelsTenant) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ModelsTenant) SetId(v string)`

SetId sets Id field to given value.


### GetName

`func (o *ModelsTenant) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *ModelsTenant) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *ModelsTenant) SetName(v string)`

SetName sets Name field to given value.


### GetSettings

`func (o *ModelsTenant) GetSettings() ModelsTenantSettings`

GetSettings returns the Settings field if non-nil, zero value otherwise.

### GetSettingsOk

`func (o *ModelsTenant) GetSettingsOk() (*ModelsTenantSettings, bool)`

GetSettingsOk returns a tuple with the Settings field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSettings

`func (o *ModelsTenant) SetSettings(v ModelsTenantSettings)`

SetSettings sets Settings field to given value.

### HasSettings

`func (o *ModelsTenant) HasSettings() bool`

HasSettings returns a boolean if a field has been set.

### GetStripeCustomerId

`func (o *ModelsTenant) GetStripeCustomerId() string`

GetStripeCustomerId returns the StripeCustomerId field if non-nil, zero value otherwise.

### GetStripeCustomerIdOk

`func (o *ModelsTenant) GetStripeCustomerIdOk() (*string, bool)`

GetStripeCustomerIdOk returns a tuple with the StripeCustomerId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeCustomerId

`func (o *ModelsTenant) SetStripeCustomerId(v string)`

SetStripeCustomerId sets StripeCustomerId field to given value.

### HasStripeCustomerId

`func (o *ModelsTenant) HasStripeCustomerId() bool`

HasStripeCustomerId returns a boolean if a field has been set.

### GetType

`func (o *ModelsTenant) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *ModelsTenant) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *ModelsTenant) SetType(v string)`

SetType sets Type field to given value.


### GetUpdatedAt

`func (o *ModelsTenant) GetUpdatedAt() string`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *ModelsTenant) GetUpdatedAtOk() (*string, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *ModelsTenant) SetUpdatedAt(v string)`

SetUpdatedAt sets UpdatedAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


