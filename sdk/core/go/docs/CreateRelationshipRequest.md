# CreateRelationshipRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Namespace** | **string** | The namespace for the relationship | 
**Object** | **string** | The object in the relationship | 
**Relation** | **string** | The relation type | 
**SubjectId** | **string** | Direct subject identifier | 
**SubjectSet** | [**SubjectSetRequest**](SubjectSetRequest.md) |  | 

## Methods

### NewCreateRelationshipRequest

`func NewCreateRelationshipRequest(namespace string, object string, relation string, subjectId string, subjectSet SubjectSetRequest, ) *CreateRelationshipRequest`

NewCreateRelationshipRequest instantiates a new CreateRelationshipRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateRelationshipRequestWithDefaults

`func NewCreateRelationshipRequestWithDefaults() *CreateRelationshipRequest`

NewCreateRelationshipRequestWithDefaults instantiates a new CreateRelationshipRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetNamespace

`func (o *CreateRelationshipRequest) GetNamespace() string`

GetNamespace returns the Namespace field if non-nil, zero value otherwise.

### GetNamespaceOk

`func (o *CreateRelationshipRequest) GetNamespaceOk() (*string, bool)`

GetNamespaceOk returns a tuple with the Namespace field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNamespace

`func (o *CreateRelationshipRequest) SetNamespace(v string)`

SetNamespace sets Namespace field to given value.


### GetObject

`func (o *CreateRelationshipRequest) GetObject() string`

GetObject returns the Object field if non-nil, zero value otherwise.

### GetObjectOk

`func (o *CreateRelationshipRequest) GetObjectOk() (*string, bool)`

GetObjectOk returns a tuple with the Object field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetObject

`func (o *CreateRelationshipRequest) SetObject(v string)`

SetObject sets Object field to given value.


### GetRelation

`func (o *CreateRelationshipRequest) GetRelation() string`

GetRelation returns the Relation field if non-nil, zero value otherwise.

### GetRelationOk

`func (o *CreateRelationshipRequest) GetRelationOk() (*string, bool)`

GetRelationOk returns a tuple with the Relation field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRelation

`func (o *CreateRelationshipRequest) SetRelation(v string)`

SetRelation sets Relation field to given value.


### GetSubjectId

`func (o *CreateRelationshipRequest) GetSubjectId() string`

GetSubjectId returns the SubjectId field if non-nil, zero value otherwise.

### GetSubjectIdOk

`func (o *CreateRelationshipRequest) GetSubjectIdOk() (*string, bool)`

GetSubjectIdOk returns a tuple with the SubjectId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubjectId

`func (o *CreateRelationshipRequest) SetSubjectId(v string)`

SetSubjectId sets SubjectId field to given value.


### GetSubjectSet

`func (o *CreateRelationshipRequest) GetSubjectSet() SubjectSetRequest`

GetSubjectSet returns the SubjectSet field if non-nil, zero value otherwise.

### GetSubjectSetOk

`func (o *CreateRelationshipRequest) GetSubjectSetOk() (*SubjectSetRequest, bool)`

GetSubjectSetOk returns a tuple with the SubjectSet field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubjectSet

`func (o *CreateRelationshipRequest) SetSubjectSet(v SubjectSetRequest)`

SetSubjectSet sets SubjectSet field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


