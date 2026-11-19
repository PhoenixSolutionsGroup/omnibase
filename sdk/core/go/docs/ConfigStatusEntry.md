# ConfigStatusEntry

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | 
**Kind** | **string** |  | 
**Name** | Pointer to **string** |  | [optional] 
**Reason** | Pointer to **string** |  | [optional] 
**State** | **string** |  | 
**StripeId** | Pointer to **string** |  | [optional] 

## Methods

### NewConfigStatusEntry

`func NewConfigStatusEntry(id string, kind string, state string, ) *ConfigStatusEntry`

NewConfigStatusEntry instantiates a new ConfigStatusEntry object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewConfigStatusEntryWithDefaults

`func NewConfigStatusEntryWithDefaults() *ConfigStatusEntry`

NewConfigStatusEntryWithDefaults instantiates a new ConfigStatusEntry object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *ConfigStatusEntry) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ConfigStatusEntry) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ConfigStatusEntry) SetId(v string)`

SetId sets Id field to given value.


### GetKind

`func (o *ConfigStatusEntry) GetKind() string`

GetKind returns the Kind field if non-nil, zero value otherwise.

### GetKindOk

`func (o *ConfigStatusEntry) GetKindOk() (*string, bool)`

GetKindOk returns a tuple with the Kind field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetKind

`func (o *ConfigStatusEntry) SetKind(v string)`

SetKind sets Kind field to given value.


### GetName

`func (o *ConfigStatusEntry) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *ConfigStatusEntry) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *ConfigStatusEntry) SetName(v string)`

SetName sets Name field to given value.

### HasName

`func (o *ConfigStatusEntry) HasName() bool`

HasName returns a boolean if a field has been set.

### GetReason

`func (o *ConfigStatusEntry) GetReason() string`

GetReason returns the Reason field if non-nil, zero value otherwise.

### GetReasonOk

`func (o *ConfigStatusEntry) GetReasonOk() (*string, bool)`

GetReasonOk returns a tuple with the Reason field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetReason

`func (o *ConfigStatusEntry) SetReason(v string)`

SetReason sets Reason field to given value.

### HasReason

`func (o *ConfigStatusEntry) HasReason() bool`

HasReason returns a boolean if a field has been set.

### GetState

`func (o *ConfigStatusEntry) GetState() string`

GetState returns the State field if non-nil, zero value otherwise.

### GetStateOk

`func (o *ConfigStatusEntry) GetStateOk() (*string, bool)`

GetStateOk returns a tuple with the State field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetState

`func (o *ConfigStatusEntry) SetState(v string)`

SetState sets State field to given value.


### GetStripeId

`func (o *ConfigStatusEntry) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *ConfigStatusEntry) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *ConfigStatusEntry) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *ConfigStatusEntry) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


