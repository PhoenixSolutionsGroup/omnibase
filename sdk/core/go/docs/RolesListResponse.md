# RolesListResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Roles** | [**[]Role**](Role.md) | List of roles (including system roles) | 

## Methods

### NewRolesListResponse

`func NewRolesListResponse(roles []Role, ) *RolesListResponse`

NewRolesListResponse instantiates a new RolesListResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewRolesListResponseWithDefaults

`func NewRolesListResponseWithDefaults() *RolesListResponse`

NewRolesListResponseWithDefaults instantiates a new RolesListResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetRoles

`func (o *RolesListResponse) GetRoles() []Role`

GetRoles returns the Roles field if non-nil, zero value otherwise.

### GetRolesOk

`func (o *RolesListResponse) GetRolesOk() (*[]Role, bool)`

GetRolesOk returns a tuple with the Roles field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRoles

`func (o *RolesListResponse) SetRoles(v []Role)`

SetRoles sets Roles field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


