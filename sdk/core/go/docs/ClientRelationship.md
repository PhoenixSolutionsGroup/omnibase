# ClientRelationship

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Namespace** | Pointer to **string** | Namespace of the Relation Tuple | [optional] 
**Object** | Pointer to **string** | Object of the Relation Tuple | [optional] 
**Relation** | Pointer to **string** | Relation of the Relation Tuple | [optional] 
**SubjectId** | Pointer to **string** | SubjectID of the Relation Tuple  Either SubjectSet or SubjectID can be provided. | [optional] 
**SubjectSet** | Pointer to [**ClientSubjectSet**](ClientSubjectSet.md) |  | [optional] 

## Methods

### NewClientRelationship

`func NewClientRelationship() *ClientRelationship`

NewClientRelationship instantiates a new ClientRelationship object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewClientRelationshipWithDefaults

`func NewClientRelationshipWithDefaults() *ClientRelationship`

NewClientRelationshipWithDefaults instantiates a new ClientRelationship object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetNamespace

`func (o *ClientRelationship) GetNamespace() string`

GetNamespace returns the Namespace field if non-nil, zero value otherwise.

### GetNamespaceOk

`func (o *ClientRelationship) GetNamespaceOk() (*string, bool)`

GetNamespaceOk returns a tuple with the Namespace field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNamespace

`func (o *ClientRelationship) SetNamespace(v string)`

SetNamespace sets Namespace field to given value.

### HasNamespace

`func (o *ClientRelationship) HasNamespace() bool`

HasNamespace returns a boolean if a field has been set.

### GetObject

`func (o *ClientRelationship) GetObject() string`

GetObject returns the Object field if non-nil, zero value otherwise.

### GetObjectOk

`func (o *ClientRelationship) GetObjectOk() (*string, bool)`

GetObjectOk returns a tuple with the Object field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetObject

`func (o *ClientRelationship) SetObject(v string)`

SetObject sets Object field to given value.

### HasObject

`func (o *ClientRelationship) HasObject() bool`

HasObject returns a boolean if a field has been set.

### GetRelation

`func (o *ClientRelationship) GetRelation() string`

GetRelation returns the Relation field if non-nil, zero value otherwise.

### GetRelationOk

`func (o *ClientRelationship) GetRelationOk() (*string, bool)`

GetRelationOk returns a tuple with the Relation field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRelation

`func (o *ClientRelationship) SetRelation(v string)`

SetRelation sets Relation field to given value.

### HasRelation

`func (o *ClientRelationship) HasRelation() bool`

HasRelation returns a boolean if a field has been set.

### GetSubjectId

`func (o *ClientRelationship) GetSubjectId() string`

GetSubjectId returns the SubjectId field if non-nil, zero value otherwise.

### GetSubjectIdOk

`func (o *ClientRelationship) GetSubjectIdOk() (*string, bool)`

GetSubjectIdOk returns a tuple with the SubjectId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubjectId

`func (o *ClientRelationship) SetSubjectId(v string)`

SetSubjectId sets SubjectId field to given value.

### HasSubjectId

`func (o *ClientRelationship) HasSubjectId() bool`

HasSubjectId returns a boolean if a field has been set.

### GetSubjectSet

`func (o *ClientRelationship) GetSubjectSet() ClientSubjectSet`

GetSubjectSet returns the SubjectSet field if non-nil, zero value otherwise.

### GetSubjectSetOk

`func (o *ClientRelationship) GetSubjectSetOk() (*ClientSubjectSet, bool)`

GetSubjectSetOk returns a tuple with the SubjectSet field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubjectSet

`func (o *ClientRelationship) SetSubjectSet(v ClientSubjectSet)`

SetSubjectSet sets SubjectSet field to given value.

### HasSubjectSet

`func (o *ClientRelationship) HasSubjectSet() bool`

HasSubjectSet returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


