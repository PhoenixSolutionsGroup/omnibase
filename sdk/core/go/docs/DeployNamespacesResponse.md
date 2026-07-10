# DeployNamespacesResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ManagedMode** | **bool** |  | 
**Message** | **string** |  | 
**Path** | **string** |  | 
**RolesSynced** | Pointer to **int64** |  | [optional] 
**TenantId** | **string** |  | 

## Methods

### NewDeployNamespacesResponse

`func NewDeployNamespacesResponse(managedMode bool, message string, path string, tenantId string, ) *DeployNamespacesResponse`

NewDeployNamespacesResponse instantiates a new DeployNamespacesResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewDeployNamespacesResponseWithDefaults

`func NewDeployNamespacesResponseWithDefaults() *DeployNamespacesResponse`

NewDeployNamespacesResponseWithDefaults instantiates a new DeployNamespacesResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetManagedMode

`func (o *DeployNamespacesResponse) GetManagedMode() bool`

GetManagedMode returns the ManagedMode field if non-nil, zero value otherwise.

### GetManagedModeOk

`func (o *DeployNamespacesResponse) GetManagedModeOk() (*bool, bool)`

GetManagedModeOk returns a tuple with the ManagedMode field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetManagedMode

`func (o *DeployNamespacesResponse) SetManagedMode(v bool)`

SetManagedMode sets ManagedMode field to given value.


### GetMessage

`func (o *DeployNamespacesResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *DeployNamespacesResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *DeployNamespacesResponse) SetMessage(v string)`

SetMessage sets Message field to given value.


### GetPath

`func (o *DeployNamespacesResponse) GetPath() string`

GetPath returns the Path field if non-nil, zero value otherwise.

### GetPathOk

`func (o *DeployNamespacesResponse) GetPathOk() (*string, bool)`

GetPathOk returns a tuple with the Path field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPath

`func (o *DeployNamespacesResponse) SetPath(v string)`

SetPath sets Path field to given value.


### GetRolesSynced

`func (o *DeployNamespacesResponse) GetRolesSynced() int64`

GetRolesSynced returns the RolesSynced field if non-nil, zero value otherwise.

### GetRolesSyncedOk

`func (o *DeployNamespacesResponse) GetRolesSyncedOk() (*int64, bool)`

GetRolesSyncedOk returns a tuple with the RolesSynced field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRolesSynced

`func (o *DeployNamespacesResponse) SetRolesSynced(v int64)`

SetRolesSynced sets RolesSynced field to given value.

### HasRolesSynced

`func (o *DeployNamespacesResponse) HasRolesSynced() bool`

HasRolesSynced returns a boolean if a field has been set.

### GetTenantId

`func (o *DeployNamespacesResponse) GetTenantId() string`

GetTenantId returns the TenantId field if non-nil, zero value otherwise.

### GetTenantIdOk

`func (o *DeployNamespacesResponse) GetTenantIdOk() (*string, bool)`

GetTenantIdOk returns a tuple with the TenantId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenantId

`func (o *DeployNamespacesResponse) SetTenantId(v string)`

SetTenantId sets TenantId field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


