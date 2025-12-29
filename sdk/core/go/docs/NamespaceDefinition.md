# NamespaceDefinition

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** | Unique namespace definition identifier | 
**Namespace** | **string** | Namespace name | 
**Relations** | **[]string** | Available relations in this namespace | 
**SubjectRelations** | Pointer to **map[string][]string** | Maps subject types to their allowed relations | [optional] 
**UpdatedAt** | **time.Time** | Timestamp when definition was last updated | 

## Methods

### NewNamespaceDefinition

`func NewNamespaceDefinition(id string, namespace string, relations []string, updatedAt time.Time, ) *NamespaceDefinition`

NewNamespaceDefinition instantiates a new NamespaceDefinition object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewNamespaceDefinitionWithDefaults

`func NewNamespaceDefinitionWithDefaults() *NamespaceDefinition`

NewNamespaceDefinitionWithDefaults instantiates a new NamespaceDefinition object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *NamespaceDefinition) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *NamespaceDefinition) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *NamespaceDefinition) SetId(v string)`

SetId sets Id field to given value.


### GetNamespace

`func (o *NamespaceDefinition) GetNamespace() string`

GetNamespace returns the Namespace field if non-nil, zero value otherwise.

### GetNamespaceOk

`func (o *NamespaceDefinition) GetNamespaceOk() (*string, bool)`

GetNamespaceOk returns a tuple with the Namespace field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNamespace

`func (o *NamespaceDefinition) SetNamespace(v string)`

SetNamespace sets Namespace field to given value.


### GetRelations

`func (o *NamespaceDefinition) GetRelations() []string`

GetRelations returns the Relations field if non-nil, zero value otherwise.

### GetRelationsOk

`func (o *NamespaceDefinition) GetRelationsOk() (*[]string, bool)`

GetRelationsOk returns a tuple with the Relations field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRelations

`func (o *NamespaceDefinition) SetRelations(v []string)`

SetRelations sets Relations field to given value.


### GetSubjectRelations

`func (o *NamespaceDefinition) GetSubjectRelations() map[string][]string`

GetSubjectRelations returns the SubjectRelations field if non-nil, zero value otherwise.

### GetSubjectRelationsOk

`func (o *NamespaceDefinition) GetSubjectRelationsOk() (*map[string][]string, bool)`

GetSubjectRelationsOk returns a tuple with the SubjectRelations field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubjectRelations

`func (o *NamespaceDefinition) SetSubjectRelations(v map[string][]string)`

SetSubjectRelations sets SubjectRelations field to given value.

### HasSubjectRelations

`func (o *NamespaceDefinition) HasSubjectRelations() bool`

HasSubjectRelations returns a boolean if a field has been set.

### GetUpdatedAt

`func (o *NamespaceDefinition) GetUpdatedAt() time.Time`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *NamespaceDefinition) GetUpdatedAtOk() (*time.Time, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *NamespaceDefinition) SetUpdatedAt(v time.Time)`

SetUpdatedAt sets UpdatedAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


