# Requirements

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Files** | [**[]File**](File.md) |  | 
**Namespaces** | [**[]ParsedNamespaceDefinition**](ParsedNamespaceDefinition.md) |  | 

## Methods

### NewRequirements

`func NewRequirements(files []File, namespaces []ParsedNamespaceDefinition, ) *Requirements`

NewRequirements instantiates a new Requirements object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewRequirementsWithDefaults

`func NewRequirementsWithDefaults() *Requirements`

NewRequirementsWithDefaults instantiates a new Requirements object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetFiles

`func (o *Requirements) GetFiles() []File`

GetFiles returns the Files field if non-nil, zero value otherwise.

### GetFilesOk

`func (o *Requirements) GetFilesOk() (*[]File, bool)`

GetFilesOk returns a tuple with the Files field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFiles

`func (o *Requirements) SetFiles(v []File)`

SetFiles sets Files field to given value.


### SetFilesNil

`func (o *Requirements) SetFilesNil(b bool)`

 SetFilesNil sets the value for Files to be an explicit nil

### UnsetFiles
`func (o *Requirements) UnsetFiles()`

UnsetFiles ensures that no value is present for Files, not even an explicit nil
### GetNamespaces

`func (o *Requirements) GetNamespaces() []ParsedNamespaceDefinition`

GetNamespaces returns the Namespaces field if non-nil, zero value otherwise.

### GetNamespacesOk

`func (o *Requirements) GetNamespacesOk() (*[]ParsedNamespaceDefinition, bool)`

GetNamespacesOk returns a tuple with the Namespaces field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNamespaces

`func (o *Requirements) SetNamespaces(v []ParsedNamespaceDefinition)`

SetNamespaces sets Namespaces field to given value.


### SetNamespacesNil

`func (o *Requirements) SetNamespacesNil(b bool)`

 SetNamespacesNil sets the value for Namespaces to be an explicit nil

### UnsetNamespaces
`func (o *Requirements) UnsetNamespaces()`

UnsetNamespaces ensures that no value is present for Namespaces, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


