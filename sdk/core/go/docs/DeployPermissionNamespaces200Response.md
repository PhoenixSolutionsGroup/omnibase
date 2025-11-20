# DeployPermissionNamespaces200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Data** | Pointer to [**NamespaceDeploymentResponse**](NamespaceDeploymentResponse.md) |  | [optional] 

## Methods

### NewDeployPermissionNamespaces200Response

`func NewDeployPermissionNamespaces200Response(status int32, ) *DeployPermissionNamespaces200Response`

NewDeployPermissionNamespaces200Response instantiates a new DeployPermissionNamespaces200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewDeployPermissionNamespaces200ResponseWithDefaults

`func NewDeployPermissionNamespaces200ResponseWithDefaults() *DeployPermissionNamespaces200Response`

NewDeployPermissionNamespaces200ResponseWithDefaults instantiates a new DeployPermissionNamespaces200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *DeployPermissionNamespaces200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *DeployPermissionNamespaces200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *DeployPermissionNamespaces200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetData

`func (o *DeployPermissionNamespaces200Response) GetData() NamespaceDeploymentResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *DeployPermissionNamespaces200Response) GetDataOk() (*NamespaceDeploymentResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *DeployPermissionNamespaces200Response) SetData(v NamespaceDeploymentResponse)`

SetData sets Data field to given value.

### HasData

`func (o *DeployPermissionNamespaces200Response) HasData() bool`

HasData returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


