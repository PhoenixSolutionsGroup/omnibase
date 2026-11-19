# ConfigStatusSummary

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Drift** | **int64** |  | 
**Pending** | **int64** |  | 
**Untracked** | **int64** |  | 

## Methods

### NewConfigStatusSummary

`func NewConfigStatusSummary(drift int64, pending int64, untracked int64, ) *ConfigStatusSummary`

NewConfigStatusSummary instantiates a new ConfigStatusSummary object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewConfigStatusSummaryWithDefaults

`func NewConfigStatusSummaryWithDefaults() *ConfigStatusSummary`

NewConfigStatusSummaryWithDefaults instantiates a new ConfigStatusSummary object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDrift

`func (o *ConfigStatusSummary) GetDrift() int64`

GetDrift returns the Drift field if non-nil, zero value otherwise.

### GetDriftOk

`func (o *ConfigStatusSummary) GetDriftOk() (*int64, bool)`

GetDriftOk returns a tuple with the Drift field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDrift

`func (o *ConfigStatusSummary) SetDrift(v int64)`

SetDrift sets Drift field to given value.


### GetPending

`func (o *ConfigStatusSummary) GetPending() int64`

GetPending returns the Pending field if non-nil, zero value otherwise.

### GetPendingOk

`func (o *ConfigStatusSummary) GetPendingOk() (*int64, bool)`

GetPendingOk returns a tuple with the Pending field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPending

`func (o *ConfigStatusSummary) SetPending(v int64)`

SetPending sets Pending field to given value.


### GetUntracked

`func (o *ConfigStatusSummary) GetUntracked() int64`

GetUntracked returns the Untracked field if non-nil, zero value otherwise.

### GetUntrackedOk

`func (o *ConfigStatusSummary) GetUntrackedOk() (*int64, bool)`

GetUntrackedOk returns a tuple with the Untracked field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUntracked

`func (o *ConfigStatusSummary) SetUntracked(v int64)`

SetUntracked sets Untracked field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


