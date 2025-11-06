# V1NamespaceDeploymentResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ManagedMode** | **bool** | Whether managed mode is enabled | 
**Message** | **string** | Success message | 
**Path** | **string** | S3 storage path | 
**RolesSynced** | Pointer to **int32** | Number of system roles synced (optional) | [optional] 
**TenantId** | **string** | Tenant ID | 

## Methods

### NewV1NamespaceDeploymentResponse

`func NewV1NamespaceDeploymentResponse(managedMode bool, message string, path string, tenantId string, ) *V1NamespaceDeploymentResponse`

NewV1NamespaceDeploymentResponse instantiates a new V1NamespaceDeploymentResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewV1NamespaceDeploymentResponseWithDefaults

`func NewV1NamespaceDeploymentResponseWithDefaults() *V1NamespaceDeploymentResponse`

NewV1NamespaceDeploymentResponseWithDefaults instantiates a new V1NamespaceDeploymentResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetManagedMode

`func (o *V1NamespaceDeploymentResponse) GetManagedMode() bool`

GetManagedMode returns the ManagedMode field if non-nil, zero value otherwise.

### GetManagedModeOk

`func (o *V1NamespaceDeploymentResponse) GetManagedModeOk() (*bool, bool)`

GetManagedModeOk returns a tuple with the ManagedMode field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetManagedMode

`func (o *V1NamespaceDeploymentResponse) SetManagedMode(v bool)`

SetManagedMode sets ManagedMode field to given value.


### GetMessage

`func (o *V1NamespaceDeploymentResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *V1NamespaceDeploymentResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *V1NamespaceDeploymentResponse) SetMessage(v string)`

SetMessage sets Message field to given value.


### GetPath

`func (o *V1NamespaceDeploymentResponse) GetPath() string`

GetPath returns the Path field if non-nil, zero value otherwise.

### GetPathOk

`func (o *V1NamespaceDeploymentResponse) GetPathOk() (*string, bool)`

GetPathOk returns a tuple with the Path field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPath

`func (o *V1NamespaceDeploymentResponse) SetPath(v string)`

SetPath sets Path field to given value.


### GetRolesSynced

`func (o *V1NamespaceDeploymentResponse) GetRolesSynced() int32`

GetRolesSynced returns the RolesSynced field if non-nil, zero value otherwise.

### GetRolesSyncedOk

`func (o *V1NamespaceDeploymentResponse) GetRolesSyncedOk() (*int32, bool)`

GetRolesSyncedOk returns a tuple with the RolesSynced field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRolesSynced

`func (o *V1NamespaceDeploymentResponse) SetRolesSynced(v int32)`

SetRolesSynced sets RolesSynced field to given value.

### HasRolesSynced

`func (o *V1NamespaceDeploymentResponse) HasRolesSynced() bool`

HasRolesSynced returns a boolean if a field has been set.

### GetTenantId

`func (o *V1NamespaceDeploymentResponse) GetTenantId() string`

GetTenantId returns the TenantId field if non-nil, zero value otherwise.

### GetTenantIdOk

`func (o *V1NamespaceDeploymentResponse) GetTenantIdOk() (*string, bool)`

GetTenantIdOk returns a tuple with the TenantId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenantId

`func (o *V1NamespaceDeploymentResponse) SetTenantId(v string)`

SetTenantId sets TenantId field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


