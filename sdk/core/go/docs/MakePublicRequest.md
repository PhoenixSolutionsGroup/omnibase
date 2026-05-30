# MakePublicRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Path** | **string** | Path of the file to make public. Must start with alphanumeric character, can contain forward slashes, underscores, dots, spaces, and hyphens. | 

## Methods

### NewMakePublicRequest

`func NewMakePublicRequest(path string, ) *MakePublicRequest`

NewMakePublicRequest instantiates a new MakePublicRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewMakePublicRequestWithDefaults

`func NewMakePublicRequestWithDefaults() *MakePublicRequest`

NewMakePublicRequestWithDefaults instantiates a new MakePublicRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPath

`func (o *MakePublicRequest) GetPath() string`

GetPath returns the Path field if non-nil, zero value otherwise.

### GetPathOk

`func (o *MakePublicRequest) GetPathOk() (*string, bool)`

GetPathOk returns a tuple with the Path field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPath

`func (o *MakePublicRequest) SetPath(v string)`

SetPath sets Path field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


