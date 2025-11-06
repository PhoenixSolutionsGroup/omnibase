# V1CheckPermissionRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Namespace** | **string** | Namespace of the relationship | 
**Object** | **string** | Object ID to check permission on | 
**Relation** | **string** | Relation to check | 
**SubjectId** | Pointer to **string** | Subject ID (user ID) to check permission for | [optional] 
**SubjectSet** | Pointer to [**V1SubjectSetRequest**](V1SubjectSetRequest.md) | Subject set (alternative to subject_id) | [optional] 

## Methods

### NewV1CheckPermissionRequest

`func NewV1CheckPermissionRequest(namespace string, object string, relation string, ) *V1CheckPermissionRequest`

NewV1CheckPermissionRequest instantiates a new V1CheckPermissionRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewV1CheckPermissionRequestWithDefaults

`func NewV1CheckPermissionRequestWithDefaults() *V1CheckPermissionRequest`

NewV1CheckPermissionRequestWithDefaults instantiates a new V1CheckPermissionRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetNamespace

`func (o *V1CheckPermissionRequest) GetNamespace() string`

GetNamespace returns the Namespace field if non-nil, zero value otherwise.

### GetNamespaceOk

`func (o *V1CheckPermissionRequest) GetNamespaceOk() (*string, bool)`

GetNamespaceOk returns a tuple with the Namespace field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNamespace

`func (o *V1CheckPermissionRequest) SetNamespace(v string)`

SetNamespace sets Namespace field to given value.


### GetObject

`func (o *V1CheckPermissionRequest) GetObject() string`

GetObject returns the Object field if non-nil, zero value otherwise.

### GetObjectOk

`func (o *V1CheckPermissionRequest) GetObjectOk() (*string, bool)`

GetObjectOk returns a tuple with the Object field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetObject

`func (o *V1CheckPermissionRequest) SetObject(v string)`

SetObject sets Object field to given value.


### GetRelation

`func (o *V1CheckPermissionRequest) GetRelation() string`

GetRelation returns the Relation field if non-nil, zero value otherwise.

### GetRelationOk

`func (o *V1CheckPermissionRequest) GetRelationOk() (*string, bool)`

GetRelationOk returns a tuple with the Relation field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRelation

`func (o *V1CheckPermissionRequest) SetRelation(v string)`

SetRelation sets Relation field to given value.


### GetSubjectId

`func (o *V1CheckPermissionRequest) GetSubjectId() string`

GetSubjectId returns the SubjectId field if non-nil, zero value otherwise.

### GetSubjectIdOk

`func (o *V1CheckPermissionRequest) GetSubjectIdOk() (*string, bool)`

GetSubjectIdOk returns a tuple with the SubjectId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubjectId

`func (o *V1CheckPermissionRequest) SetSubjectId(v string)`

SetSubjectId sets SubjectId field to given value.

### HasSubjectId

`func (o *V1CheckPermissionRequest) HasSubjectId() bool`

HasSubjectId returns a boolean if a field has been set.

### GetSubjectSet

`func (o *V1CheckPermissionRequest) GetSubjectSet() V1SubjectSetRequest`

GetSubjectSet returns the SubjectSet field if non-nil, zero value otherwise.

### GetSubjectSetOk

`func (o *V1CheckPermissionRequest) GetSubjectSetOk() (*V1SubjectSetRequest, bool)`

GetSubjectSetOk returns a tuple with the SubjectSet field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubjectSet

`func (o *V1CheckPermissionRequest) SetSubjectSet(v V1SubjectSetRequest)`

SetSubjectSet sets SubjectSet field to given value.

### HasSubjectSet

`func (o *V1CheckPermissionRequest) HasSubjectSet() bool`

HasSubjectSet returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


