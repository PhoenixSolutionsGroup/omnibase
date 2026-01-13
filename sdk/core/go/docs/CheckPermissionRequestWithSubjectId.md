# CheckPermissionRequestWithSubjectId

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Namespace** | **string** | The namespace of the permission check | 
**Object** | **string** | The object to check permissions on | 
**Relation** | **string** | The relation/permission to check | 
**SubjectId** | **string** | Direct subject identifier | 

## Methods

### NewCheckPermissionRequestWithSubjectId

`func NewCheckPermissionRequestWithSubjectId(namespace string, object string, relation string, subjectId string, ) *CheckPermissionRequestWithSubjectId`

NewCheckPermissionRequestWithSubjectId instantiates a new CheckPermissionRequestWithSubjectId object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCheckPermissionRequestWithSubjectIdWithDefaults

`func NewCheckPermissionRequestWithSubjectIdWithDefaults() *CheckPermissionRequestWithSubjectId`

NewCheckPermissionRequestWithSubjectIdWithDefaults instantiates a new CheckPermissionRequestWithSubjectId object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetNamespace

`func (o *CheckPermissionRequestWithSubjectId) GetNamespace() string`

GetNamespace returns the Namespace field if non-nil, zero value otherwise.

### GetNamespaceOk

`func (o *CheckPermissionRequestWithSubjectId) GetNamespaceOk() (*string, bool)`

GetNamespaceOk returns a tuple with the Namespace field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNamespace

`func (o *CheckPermissionRequestWithSubjectId) SetNamespace(v string)`

SetNamespace sets Namespace field to given value.


### GetObject

`func (o *CheckPermissionRequestWithSubjectId) GetObject() string`

GetObject returns the Object field if non-nil, zero value otherwise.

### GetObjectOk

`func (o *CheckPermissionRequestWithSubjectId) GetObjectOk() (*string, bool)`

GetObjectOk returns a tuple with the Object field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetObject

`func (o *CheckPermissionRequestWithSubjectId) SetObject(v string)`

SetObject sets Object field to given value.


### GetRelation

`func (o *CheckPermissionRequestWithSubjectId) GetRelation() string`

GetRelation returns the Relation field if non-nil, zero value otherwise.

### GetRelationOk

`func (o *CheckPermissionRequestWithSubjectId) GetRelationOk() (*string, bool)`

GetRelationOk returns a tuple with the Relation field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRelation

`func (o *CheckPermissionRequestWithSubjectId) SetRelation(v string)`

SetRelation sets Relation field to given value.


### GetSubjectId

`func (o *CheckPermissionRequestWithSubjectId) GetSubjectId() string`

GetSubjectId returns the SubjectId field if non-nil, zero value otherwise.

### GetSubjectIdOk

`func (o *CheckPermissionRequestWithSubjectId) GetSubjectIdOk() (*string, bool)`

GetSubjectIdOk returns a tuple with the SubjectId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubjectId

`func (o *CheckPermissionRequestWithSubjectId) SetSubjectId(v string)`

SetSubjectId sets SubjectId field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


