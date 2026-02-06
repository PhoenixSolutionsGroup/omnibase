# RelationMetadata

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | **string** | Relation name as defined in TypeScript | 
**DisplayName** | **string** | Human-readable display name (auto-generated or from @displayName) | 
**Group** | Pointer to **string** | UI grouping from @group annotation (null if ungrouped) | [optional] 
**SubGroup** | Pointer to **string** | Nested UI grouping from @subGroup annotation (null if no subgroup) | [optional] 
**Roles** | Pointer to **[]string** | Roles that have this permission (from @role annotations) | [optional] 
**Subjects** | **[]string** | Subject types that can have this relation | 

## Methods

### NewRelationMetadata

`func NewRelationMetadata(name string, displayName string, subjects []string, ) *RelationMetadata`

NewRelationMetadata instantiates a new RelationMetadata object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewRelationMetadataWithDefaults

`func NewRelationMetadataWithDefaults() *RelationMetadata`

NewRelationMetadataWithDefaults instantiates a new RelationMetadata object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetName

`func (o *RelationMetadata) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *RelationMetadata) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *RelationMetadata) SetName(v string)`

SetName sets Name field to given value.


### GetDisplayName

`func (o *RelationMetadata) GetDisplayName() string`

GetDisplayName returns the DisplayName field if non-nil, zero value otherwise.

### GetDisplayNameOk

`func (o *RelationMetadata) GetDisplayNameOk() (*string, bool)`

GetDisplayNameOk returns a tuple with the DisplayName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDisplayName

`func (o *RelationMetadata) SetDisplayName(v string)`

SetDisplayName sets DisplayName field to given value.


### GetGroup

`func (o *RelationMetadata) GetGroup() string`

GetGroup returns the Group field if non-nil, zero value otherwise.

### GetGroupOk

`func (o *RelationMetadata) GetGroupOk() (*string, bool)`

GetGroupOk returns a tuple with the Group field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetGroup

`func (o *RelationMetadata) SetGroup(v string)`

SetGroup sets Group field to given value.

### HasGroup

`func (o *RelationMetadata) HasGroup() bool`

HasGroup returns a boolean if a field has been set.

### GetSubGroup

`func (o *RelationMetadata) GetSubGroup() string`

GetSubGroup returns the SubGroup field if non-nil, zero value otherwise.

### GetSubGroupOk

`func (o *RelationMetadata) GetSubGroupOk() (*string, bool)`

GetSubGroupOk returns a tuple with the SubGroup field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubGroup

`func (o *RelationMetadata) SetSubGroup(v string)`

SetSubGroup sets SubGroup field to given value.

### HasSubGroup

`func (o *RelationMetadata) HasSubGroup() bool`

HasSubGroup returns a boolean if a field has been set.

### GetRoles

`func (o *RelationMetadata) GetRoles() []string`

GetRoles returns the Roles field if non-nil, zero value otherwise.

### GetRolesOk

`func (o *RelationMetadata) GetRolesOk() (*[]string, bool)`

GetRolesOk returns a tuple with the Roles field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRoles

`func (o *RelationMetadata) SetRoles(v []string)`

SetRoles sets Roles field to given value.

### HasRoles

`func (o *RelationMetadata) HasRoles() bool`

HasRoles returns a boolean if a field has been set.

### GetSubjects

`func (o *RelationMetadata) GetSubjects() []string`

GetSubjects returns the Subjects field if non-nil, zero value otherwise.

### GetSubjectsOk

`func (o *RelationMetadata) GetSubjectsOk() (*[]string, bool)`

GetSubjectsOk returns a tuple with the Subjects field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubjects

`func (o *RelationMetadata) SetSubjects(v []string)`

SetSubjects sets Subjects field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


