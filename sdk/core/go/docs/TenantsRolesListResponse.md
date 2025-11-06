# TenantsRolesListResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Roles** | [**[]ModelsRole**](ModelsRole.md) | List of roles (including system roles) | 

## Methods

### NewTenantsRolesListResponse

`func NewTenantsRolesListResponse(roles []ModelsRole, ) *TenantsRolesListResponse`

NewTenantsRolesListResponse instantiates a new TenantsRolesListResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTenantsRolesListResponseWithDefaults

`func NewTenantsRolesListResponseWithDefaults() *TenantsRolesListResponse`

NewTenantsRolesListResponseWithDefaults instantiates a new TenantsRolesListResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetRoles

`func (o *TenantsRolesListResponse) GetRoles() []ModelsRole`

GetRoles returns the Roles field if non-nil, zero value otherwise.

### GetRolesOk

`func (o *TenantsRolesListResponse) GetRolesOk() (*[]ModelsRole, bool)`

GetRolesOk returns a tuple with the Roles field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRoles

`func (o *TenantsRolesListResponse) SetRoles(v []ModelsRole)`

SetRoles sets Roles field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


