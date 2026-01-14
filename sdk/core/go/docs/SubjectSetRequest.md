# SubjectSetRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Namespace** | **string** | Namespace of the subject set | 
**Object** | **string** | Object of the subject set (e.g., user ID) | 
**Relation** | Pointer to **string** | Relation of the subject set (optional) | [optional] 

## Methods

### NewSubjectSetRequest

`func NewSubjectSetRequest(namespace string, object string, ) *SubjectSetRequest`

NewSubjectSetRequest instantiates a new SubjectSetRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSubjectSetRequestWithDefaults

`func NewSubjectSetRequestWithDefaults() *SubjectSetRequest`

NewSubjectSetRequestWithDefaults instantiates a new SubjectSetRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetNamespace

`func (o *SubjectSetRequest) GetNamespace() string`

GetNamespace returns the Namespace field if non-nil, zero value otherwise.

### GetNamespaceOk

`func (o *SubjectSetRequest) GetNamespaceOk() (*string, bool)`

GetNamespaceOk returns a tuple with the Namespace field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNamespace

`func (o *SubjectSetRequest) SetNamespace(v string)`

SetNamespace sets Namespace field to given value.


### GetObject

`func (o *SubjectSetRequest) GetObject() string`

GetObject returns the Object field if non-nil, zero value otherwise.

### GetObjectOk

`func (o *SubjectSetRequest) GetObjectOk() (*string, bool)`

GetObjectOk returns a tuple with the Object field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetObject

`func (o *SubjectSetRequest) SetObject(v string)`

SetObject sets Object field to given value.


### GetRelation

`func (o *SubjectSetRequest) GetRelation() string`

GetRelation returns the Relation field if non-nil, zero value otherwise.

### GetRelationOk

`func (o *SubjectSetRequest) GetRelationOk() (*string, bool)`

GetRelationOk returns a tuple with the Relation field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRelation

`func (o *SubjectSetRequest) SetRelation(v string)`

SetRelation sets Relation field to given value.

### HasRelation

`func (o *SubjectSetRequest) HasRelation() bool`

HasRelation returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


