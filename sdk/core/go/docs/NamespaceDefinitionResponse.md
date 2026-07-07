# NamespaceDefinitionResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | 
**Namespace** | **string** |  | 
**Relations** | **[]string** |  | 
**SubjectRelations** | **map[string][]string** |  | 
**UpdatedAt** | **time.Time** |  | 

## Methods

### NewNamespaceDefinitionResponse

`func NewNamespaceDefinitionResponse(id string, namespace string, relations []string, subjectRelations map[string][]string, updatedAt time.Time, ) *NamespaceDefinitionResponse`

NewNamespaceDefinitionResponse instantiates a new NamespaceDefinitionResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewNamespaceDefinitionResponseWithDefaults

`func NewNamespaceDefinitionResponseWithDefaults() *NamespaceDefinitionResponse`

NewNamespaceDefinitionResponseWithDefaults instantiates a new NamespaceDefinitionResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *NamespaceDefinitionResponse) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *NamespaceDefinitionResponse) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *NamespaceDefinitionResponse) SetId(v string)`

SetId sets Id field to given value.


### GetNamespace

`func (o *NamespaceDefinitionResponse) GetNamespace() string`

GetNamespace returns the Namespace field if non-nil, zero value otherwise.

### GetNamespaceOk

`func (o *NamespaceDefinitionResponse) GetNamespaceOk() (*string, bool)`

GetNamespaceOk returns a tuple with the Namespace field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNamespace

`func (o *NamespaceDefinitionResponse) SetNamespace(v string)`

SetNamespace sets Namespace field to given value.


### GetRelations

`func (o *NamespaceDefinitionResponse) GetRelations() []string`

GetRelations returns the Relations field if non-nil, zero value otherwise.

### GetRelationsOk

`func (o *NamespaceDefinitionResponse) GetRelationsOk() (*[]string, bool)`

GetRelationsOk returns a tuple with the Relations field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRelations

`func (o *NamespaceDefinitionResponse) SetRelations(v []string)`

SetRelations sets Relations field to given value.


### SetRelationsNil

`func (o *NamespaceDefinitionResponse) SetRelationsNil(b bool)`

 SetRelationsNil sets the value for Relations to be an explicit nil

### UnsetRelations
`func (o *NamespaceDefinitionResponse) UnsetRelations()`

UnsetRelations ensures that no value is present for Relations, not even an explicit nil
### GetSubjectRelations

`func (o *NamespaceDefinitionResponse) GetSubjectRelations() map[string][]string`

GetSubjectRelations returns the SubjectRelations field if non-nil, zero value otherwise.

### GetSubjectRelationsOk

`func (o *NamespaceDefinitionResponse) GetSubjectRelationsOk() (*map[string][]string, bool)`

GetSubjectRelationsOk returns a tuple with the SubjectRelations field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubjectRelations

`func (o *NamespaceDefinitionResponse) SetSubjectRelations(v map[string][]string)`

SetSubjectRelations sets SubjectRelations field to given value.


### GetUpdatedAt

`func (o *NamespaceDefinitionResponse) GetUpdatedAt() time.Time`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *NamespaceDefinitionResponse) GetUpdatedAtOk() (*time.Time, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *NamespaceDefinitionResponse) SetUpdatedAt(v time.Time)`

SetUpdatedAt sets UpdatedAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


