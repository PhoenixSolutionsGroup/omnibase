# CheckPermissionRequestOneOf

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Namespace** | **string** | The namespace of the permission check | 
**Object** | **string** | The object to check permissions on | 
**Relation** | **string** | The relation/permission to check | 
**SubjectId** | **string** | Direct subject identifier | 

## Methods

### NewCheckPermissionRequestOneOf

`func NewCheckPermissionRequestOneOf(namespace string, object string, relation string, subjectId string, ) *CheckPermissionRequestOneOf`

NewCheckPermissionRequestOneOf instantiates a new CheckPermissionRequestOneOf object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCheckPermissionRequestOneOfWithDefaults

`func NewCheckPermissionRequestOneOfWithDefaults() *CheckPermissionRequestOneOf`

NewCheckPermissionRequestOneOfWithDefaults instantiates a new CheckPermissionRequestOneOf object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetNamespace

`func (o *CheckPermissionRequestOneOf) GetNamespace() string`

GetNamespace returns the Namespace field if non-nil, zero value otherwise.

### GetNamespaceOk

`func (o *CheckPermissionRequestOneOf) GetNamespaceOk() (*string, bool)`

GetNamespaceOk returns a tuple with the Namespace field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNamespace

`func (o *CheckPermissionRequestOneOf) SetNamespace(v string)`

SetNamespace sets Namespace field to given value.


### GetObject

`func (o *CheckPermissionRequestOneOf) GetObject() string`

GetObject returns the Object field if non-nil, zero value otherwise.

### GetObjectOk

`func (o *CheckPermissionRequestOneOf) GetObjectOk() (*string, bool)`

GetObjectOk returns a tuple with the Object field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetObject

`func (o *CheckPermissionRequestOneOf) SetObject(v string)`

SetObject sets Object field to given value.


### GetRelation

`func (o *CheckPermissionRequestOneOf) GetRelation() string`

GetRelation returns the Relation field if non-nil, zero value otherwise.

### GetRelationOk

`func (o *CheckPermissionRequestOneOf) GetRelationOk() (*string, bool)`

GetRelationOk returns a tuple with the Relation field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRelation

`func (o *CheckPermissionRequestOneOf) SetRelation(v string)`

SetRelation sets Relation field to given value.


### GetSubjectId

`func (o *CheckPermissionRequestOneOf) GetSubjectId() string`

GetSubjectId returns the SubjectId field if non-nil, zero value otherwise.

### GetSubjectIdOk

`func (o *CheckPermissionRequestOneOf) GetSubjectIdOk() (*string, bool)`

GetSubjectIdOk returns a tuple with the SubjectId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubjectId

`func (o *CheckPermissionRequestOneOf) SetSubjectId(v string)`

SetSubjectId sets SubjectId field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


