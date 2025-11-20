# CreateRelationshipRequestOneOf1

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Namespace** | **string** | The namespace for the relationship | 
**Object** | **string** | The object in the relationship | 
**Relation** | **string** | The relation type | 
**SubjectSet** | [**SubjectSetRequest**](SubjectSetRequest.md) |  | 

## Methods

### NewCreateRelationshipRequestOneOf1

`func NewCreateRelationshipRequestOneOf1(namespace string, object string, relation string, subjectSet SubjectSetRequest, ) *CreateRelationshipRequestOneOf1`

NewCreateRelationshipRequestOneOf1 instantiates a new CreateRelationshipRequestOneOf1 object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateRelationshipRequestOneOf1WithDefaults

`func NewCreateRelationshipRequestOneOf1WithDefaults() *CreateRelationshipRequestOneOf1`

NewCreateRelationshipRequestOneOf1WithDefaults instantiates a new CreateRelationshipRequestOneOf1 object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetNamespace

`func (o *CreateRelationshipRequestOneOf1) GetNamespace() string`

GetNamespace returns the Namespace field if non-nil, zero value otherwise.

### GetNamespaceOk

`func (o *CreateRelationshipRequestOneOf1) GetNamespaceOk() (*string, bool)`

GetNamespaceOk returns a tuple with the Namespace field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNamespace

`func (o *CreateRelationshipRequestOneOf1) SetNamespace(v string)`

SetNamespace sets Namespace field to given value.


### GetObject

`func (o *CreateRelationshipRequestOneOf1) GetObject() string`

GetObject returns the Object field if non-nil, zero value otherwise.

### GetObjectOk

`func (o *CreateRelationshipRequestOneOf1) GetObjectOk() (*string, bool)`

GetObjectOk returns a tuple with the Object field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetObject

`func (o *CreateRelationshipRequestOneOf1) SetObject(v string)`

SetObject sets Object field to given value.


### GetRelation

`func (o *CreateRelationshipRequestOneOf1) GetRelation() string`

GetRelation returns the Relation field if non-nil, zero value otherwise.

### GetRelationOk

`func (o *CreateRelationshipRequestOneOf1) GetRelationOk() (*string, bool)`

GetRelationOk returns a tuple with the Relation field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRelation

`func (o *CreateRelationshipRequestOneOf1) SetRelation(v string)`

SetRelation sets Relation field to given value.


### GetSubjectSet

`func (o *CreateRelationshipRequestOneOf1) GetSubjectSet() SubjectSetRequest`

GetSubjectSet returns the SubjectSet field if non-nil, zero value otherwise.

### GetSubjectSetOk

`func (o *CreateRelationshipRequestOneOf1) GetSubjectSetOk() (*SubjectSetRequest, bool)`

GetSubjectSetOk returns a tuple with the SubjectSet field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubjectSet

`func (o *CreateRelationshipRequestOneOf1) SetSubjectSet(v SubjectSetRequest)`

SetSubjectSet sets SubjectSet field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


