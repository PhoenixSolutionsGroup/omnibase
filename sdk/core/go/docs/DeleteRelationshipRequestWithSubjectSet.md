# DeleteRelationshipRequestWithSubjectSet

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Namespace** | **string** | The namespace for the relationship | 
**Object** | **string** | The object in the relationship | 
**Relation** | **string** | The relation type | 
**SubjectSet** | [**SubjectSetRequest**](SubjectSetRequest.md) |  | 

## Methods

### NewDeleteRelationshipRequestWithSubjectSet

`func NewDeleteRelationshipRequestWithSubjectSet(namespace string, object string, relation string, subjectSet SubjectSetRequest, ) *DeleteRelationshipRequestWithSubjectSet`

NewDeleteRelationshipRequestWithSubjectSet instantiates a new DeleteRelationshipRequestWithSubjectSet object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewDeleteRelationshipRequestWithSubjectSetWithDefaults

`func NewDeleteRelationshipRequestWithSubjectSetWithDefaults() *DeleteRelationshipRequestWithSubjectSet`

NewDeleteRelationshipRequestWithSubjectSetWithDefaults instantiates a new DeleteRelationshipRequestWithSubjectSet object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetNamespace

`func (o *DeleteRelationshipRequestWithSubjectSet) GetNamespace() string`

GetNamespace returns the Namespace field if non-nil, zero value otherwise.

### GetNamespaceOk

`func (o *DeleteRelationshipRequestWithSubjectSet) GetNamespaceOk() (*string, bool)`

GetNamespaceOk returns a tuple with the Namespace field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNamespace

`func (o *DeleteRelationshipRequestWithSubjectSet) SetNamespace(v string)`

SetNamespace sets Namespace field to given value.


### GetObject

`func (o *DeleteRelationshipRequestWithSubjectSet) GetObject() string`

GetObject returns the Object field if non-nil, zero value otherwise.

### GetObjectOk

`func (o *DeleteRelationshipRequestWithSubjectSet) GetObjectOk() (*string, bool)`

GetObjectOk returns a tuple with the Object field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetObject

`func (o *DeleteRelationshipRequestWithSubjectSet) SetObject(v string)`

SetObject sets Object field to given value.


### GetRelation

`func (o *DeleteRelationshipRequestWithSubjectSet) GetRelation() string`

GetRelation returns the Relation field if non-nil, zero value otherwise.

### GetRelationOk

`func (o *DeleteRelationshipRequestWithSubjectSet) GetRelationOk() (*string, bool)`

GetRelationOk returns a tuple with the Relation field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRelation

`func (o *DeleteRelationshipRequestWithSubjectSet) SetRelation(v string)`

SetRelation sets Relation field to given value.


### GetSubjectSet

`func (o *DeleteRelationshipRequestWithSubjectSet) GetSubjectSet() SubjectSetRequest`

GetSubjectSet returns the SubjectSet field if non-nil, zero value otherwise.

### GetSubjectSetOk

`func (o *DeleteRelationshipRequestWithSubjectSet) GetSubjectSetOk() (*SubjectSetRequest, bool)`

GetSubjectSetOk returns a tuple with the SubjectSet field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubjectSet

`func (o *DeleteRelationshipRequestWithSubjectSet) SetSubjectSet(v SubjectSetRequest)`

SetSubjectSet sets SubjectSet field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


