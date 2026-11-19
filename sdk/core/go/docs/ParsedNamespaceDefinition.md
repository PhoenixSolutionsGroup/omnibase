# ParsedNamespaceDefinition

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**File** | **string** |  | 
**Namespace** | **string** |  | 
**Permits** | **[]string** |  | 
**Relations** | **[]string** |  | 
**RelationsMetadata** | Pointer to [**[]RelationMetadata**](RelationMetadata.md) |  | [optional] 
**SubjectRelations** | **map[string][]string** |  | 

## Methods

### NewParsedNamespaceDefinition

`func NewParsedNamespaceDefinition(file string, namespace string, permits []string, relations []string, subjectRelations map[string][]string, ) *ParsedNamespaceDefinition`

NewParsedNamespaceDefinition instantiates a new ParsedNamespaceDefinition object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewParsedNamespaceDefinitionWithDefaults

`func NewParsedNamespaceDefinitionWithDefaults() *ParsedNamespaceDefinition`

NewParsedNamespaceDefinitionWithDefaults instantiates a new ParsedNamespaceDefinition object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetFile

`func (o *ParsedNamespaceDefinition) GetFile() string`

GetFile returns the File field if non-nil, zero value otherwise.

### GetFileOk

`func (o *ParsedNamespaceDefinition) GetFileOk() (*string, bool)`

GetFileOk returns a tuple with the File field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFile

`func (o *ParsedNamespaceDefinition) SetFile(v string)`

SetFile sets File field to given value.


### GetNamespace

`func (o *ParsedNamespaceDefinition) GetNamespace() string`

GetNamespace returns the Namespace field if non-nil, zero value otherwise.

### GetNamespaceOk

`func (o *ParsedNamespaceDefinition) GetNamespaceOk() (*string, bool)`

GetNamespaceOk returns a tuple with the Namespace field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNamespace

`func (o *ParsedNamespaceDefinition) SetNamespace(v string)`

SetNamespace sets Namespace field to given value.


### GetPermits

`func (o *ParsedNamespaceDefinition) GetPermits() []string`

GetPermits returns the Permits field if non-nil, zero value otherwise.

### GetPermitsOk

`func (o *ParsedNamespaceDefinition) GetPermitsOk() (*[]string, bool)`

GetPermitsOk returns a tuple with the Permits field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPermits

`func (o *ParsedNamespaceDefinition) SetPermits(v []string)`

SetPermits sets Permits field to given value.


### SetPermitsNil

`func (o *ParsedNamespaceDefinition) SetPermitsNil(b bool)`

 SetPermitsNil sets the value for Permits to be an explicit nil

### UnsetPermits
`func (o *ParsedNamespaceDefinition) UnsetPermits()`

UnsetPermits ensures that no value is present for Permits, not even an explicit nil
### GetRelations

`func (o *ParsedNamespaceDefinition) GetRelations() []string`

GetRelations returns the Relations field if non-nil, zero value otherwise.

### GetRelationsOk

`func (o *ParsedNamespaceDefinition) GetRelationsOk() (*[]string, bool)`

GetRelationsOk returns a tuple with the Relations field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRelations

`func (o *ParsedNamespaceDefinition) SetRelations(v []string)`

SetRelations sets Relations field to given value.


### SetRelationsNil

`func (o *ParsedNamespaceDefinition) SetRelationsNil(b bool)`

 SetRelationsNil sets the value for Relations to be an explicit nil

### UnsetRelations
`func (o *ParsedNamespaceDefinition) UnsetRelations()`

UnsetRelations ensures that no value is present for Relations, not even an explicit nil
### GetRelationsMetadata

`func (o *ParsedNamespaceDefinition) GetRelationsMetadata() []RelationMetadata`

GetRelationsMetadata returns the RelationsMetadata field if non-nil, zero value otherwise.

### GetRelationsMetadataOk

`func (o *ParsedNamespaceDefinition) GetRelationsMetadataOk() (*[]RelationMetadata, bool)`

GetRelationsMetadataOk returns a tuple with the RelationsMetadata field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRelationsMetadata

`func (o *ParsedNamespaceDefinition) SetRelationsMetadata(v []RelationMetadata)`

SetRelationsMetadata sets RelationsMetadata field to given value.

### HasRelationsMetadata

`func (o *ParsedNamespaceDefinition) HasRelationsMetadata() bool`

HasRelationsMetadata returns a boolean if a field has been set.

### SetRelationsMetadataNil

`func (o *ParsedNamespaceDefinition) SetRelationsMetadataNil(b bool)`

 SetRelationsMetadataNil sets the value for RelationsMetadata to be an explicit nil

### UnsetRelationsMetadata
`func (o *ParsedNamespaceDefinition) UnsetRelationsMetadata()`

UnsetRelationsMetadata ensures that no value is present for RelationsMetadata, not even an explicit nil
### GetSubjectRelations

`func (o *ParsedNamespaceDefinition) GetSubjectRelations() map[string][]string`

GetSubjectRelations returns the SubjectRelations field if non-nil, zero value otherwise.

### GetSubjectRelationsOk

`func (o *ParsedNamespaceDefinition) GetSubjectRelationsOk() (*map[string][]string, bool)`

GetSubjectRelationsOk returns a tuple with the SubjectRelations field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubjectRelations

`func (o *ParsedNamespaceDefinition) SetSubjectRelations(v map[string][]string)`

SetSubjectRelations sets SubjectRelations field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


