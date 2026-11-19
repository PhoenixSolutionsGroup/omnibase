# AppliedMigration

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Dirty** | **bool** |  | 
**Version** | **int64** |  | 

## Methods

### NewAppliedMigration

`func NewAppliedMigration(dirty bool, version int64, ) *AppliedMigration`

NewAppliedMigration instantiates a new AppliedMigration object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAppliedMigrationWithDefaults

`func NewAppliedMigrationWithDefaults() *AppliedMigration`

NewAppliedMigrationWithDefaults instantiates a new AppliedMigration object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDirty

`func (o *AppliedMigration) GetDirty() bool`

GetDirty returns the Dirty field if non-nil, zero value otherwise.

### GetDirtyOk

`func (o *AppliedMigration) GetDirtyOk() (*bool, bool)`

GetDirtyOk returns a tuple with the Dirty field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDirty

`func (o *AppliedMigration) SetDirty(v bool)`

SetDirty sets Dirty field to given value.


### GetVersion

`func (o *AppliedMigration) GetVersion() int64`

GetVersion returns the Version field if non-nil, zero value otherwise.

### GetVersionOk

`func (o *AppliedMigration) GetVersionOk() (*int64, bool)`

GetVersionOk returns a tuple with the Version field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVersion

`func (o *AppliedMigration) SetVersion(v int64)`

SetVersion sets Version field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


