# ConfigStatus

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Drift** | [**[]ConfigStatusEntry**](ConfigStatusEntry.md) |  | 
**Pending** | [**[]ConfigStatusEntry**](ConfigStatusEntry.md) |  | 
**Summary** | [**ConfigStatusSummary**](ConfigStatusSummary.md) |  | 
**Untracked** | [**[]ConfigStatusEntry**](ConfigStatusEntry.md) |  | 

## Methods

### NewConfigStatus

`func NewConfigStatus(drift []ConfigStatusEntry, pending []ConfigStatusEntry, summary ConfigStatusSummary, untracked []ConfigStatusEntry, ) *ConfigStatus`

NewConfigStatus instantiates a new ConfigStatus object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewConfigStatusWithDefaults

`func NewConfigStatusWithDefaults() *ConfigStatus`

NewConfigStatusWithDefaults instantiates a new ConfigStatus object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDrift

`func (o *ConfigStatus) GetDrift() []ConfigStatusEntry`

GetDrift returns the Drift field if non-nil, zero value otherwise.

### GetDriftOk

`func (o *ConfigStatus) GetDriftOk() (*[]ConfigStatusEntry, bool)`

GetDriftOk returns a tuple with the Drift field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDrift

`func (o *ConfigStatus) SetDrift(v []ConfigStatusEntry)`

SetDrift sets Drift field to given value.


### SetDriftNil

`func (o *ConfigStatus) SetDriftNil(b bool)`

 SetDriftNil sets the value for Drift to be an explicit nil

### UnsetDrift
`func (o *ConfigStatus) UnsetDrift()`

UnsetDrift ensures that no value is present for Drift, not even an explicit nil
### GetPending

`func (o *ConfigStatus) GetPending() []ConfigStatusEntry`

GetPending returns the Pending field if non-nil, zero value otherwise.

### GetPendingOk

`func (o *ConfigStatus) GetPendingOk() (*[]ConfigStatusEntry, bool)`

GetPendingOk returns a tuple with the Pending field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPending

`func (o *ConfigStatus) SetPending(v []ConfigStatusEntry)`

SetPending sets Pending field to given value.


### SetPendingNil

`func (o *ConfigStatus) SetPendingNil(b bool)`

 SetPendingNil sets the value for Pending to be an explicit nil

### UnsetPending
`func (o *ConfigStatus) UnsetPending()`

UnsetPending ensures that no value is present for Pending, not even an explicit nil
### GetSummary

`func (o *ConfigStatus) GetSummary() ConfigStatusSummary`

GetSummary returns the Summary field if non-nil, zero value otherwise.

### GetSummaryOk

`func (o *ConfigStatus) GetSummaryOk() (*ConfigStatusSummary, bool)`

GetSummaryOk returns a tuple with the Summary field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSummary

`func (o *ConfigStatus) SetSummary(v ConfigStatusSummary)`

SetSummary sets Summary field to given value.


### GetUntracked

`func (o *ConfigStatus) GetUntracked() []ConfigStatusEntry`

GetUntracked returns the Untracked field if non-nil, zero value otherwise.

### GetUntrackedOk

`func (o *ConfigStatus) GetUntrackedOk() (*[]ConfigStatusEntry, bool)`

GetUntrackedOk returns a tuple with the Untracked field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUntracked

`func (o *ConfigStatus) SetUntracked(v []ConfigStatusEntry)`

SetUntracked sets Untracked field to given value.


### SetUntrackedNil

`func (o *ConfigStatus) SetUntrackedNil(b bool)`

 SetUntrackedNil sets the value for Untracked to be an explicit nil

### UnsetUntracked
`func (o *ConfigStatus) UnsetUntracked()`

UnsetUntracked ensures that no value is present for Untracked, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


