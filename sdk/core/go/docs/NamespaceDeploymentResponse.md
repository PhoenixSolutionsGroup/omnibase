# NamespaceDeploymentResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | **string** | Success message | 
**TenantId** | **string** | Tenant ID | 
**Path** | **string** | S3 storage path | 
**ManagedMode** | **bool** | Whether managed mode is enabled | 
**RolesSynced** | Pointer to **int32** | Number of system roles synced (optional) | [optional] 

## Methods

### NewNamespaceDeploymentResponse

`func NewNamespaceDeploymentResponse(message string, tenantId string, path string, managedMode bool, ) *NamespaceDeploymentResponse`

NewNamespaceDeploymentResponse instantiates a new NamespaceDeploymentResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewNamespaceDeploymentResponseWithDefaults

`func NewNamespaceDeploymentResponseWithDefaults() *NamespaceDeploymentResponse`

NewNamespaceDeploymentResponseWithDefaults instantiates a new NamespaceDeploymentResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMessage

`func (o *NamespaceDeploymentResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *NamespaceDeploymentResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *NamespaceDeploymentResponse) SetMessage(v string)`

SetMessage sets Message field to given value.


### GetTenantId

`func (o *NamespaceDeploymentResponse) GetTenantId() string`

GetTenantId returns the TenantId field if non-nil, zero value otherwise.

### GetTenantIdOk

`func (o *NamespaceDeploymentResponse) GetTenantIdOk() (*string, bool)`

GetTenantIdOk returns a tuple with the TenantId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenantId

`func (o *NamespaceDeploymentResponse) SetTenantId(v string)`

SetTenantId sets TenantId field to given value.


### GetPath

`func (o *NamespaceDeploymentResponse) GetPath() string`

GetPath returns the Path field if non-nil, zero value otherwise.

### GetPathOk

`func (o *NamespaceDeploymentResponse) GetPathOk() (*string, bool)`

GetPathOk returns a tuple with the Path field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPath

`func (o *NamespaceDeploymentResponse) SetPath(v string)`

SetPath sets Path field to given value.


### GetManagedMode

`func (o *NamespaceDeploymentResponse) GetManagedMode() bool`

GetManagedMode returns the ManagedMode field if non-nil, zero value otherwise.

### GetManagedModeOk

`func (o *NamespaceDeploymentResponse) GetManagedModeOk() (*bool, bool)`

GetManagedModeOk returns a tuple with the ManagedMode field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetManagedMode

`func (o *NamespaceDeploymentResponse) SetManagedMode(v bool)`

SetManagedMode sets ManagedMode field to given value.


### GetRolesSynced

`func (o *NamespaceDeploymentResponse) GetRolesSynced() int32`

GetRolesSynced returns the RolesSynced field if non-nil, zero value otherwise.

### GetRolesSyncedOk

`func (o *NamespaceDeploymentResponse) GetRolesSyncedOk() (*int32, bool)`

GetRolesSyncedOk returns a tuple with the RolesSynced field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRolesSynced

`func (o *NamespaceDeploymentResponse) SetRolesSynced(v int32)`

SetRolesSynced sets RolesSynced field to given value.

### HasRolesSynced

`func (o *NamespaceDeploymentResponse) HasRolesSynced() bool`

HasRolesSynced returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


