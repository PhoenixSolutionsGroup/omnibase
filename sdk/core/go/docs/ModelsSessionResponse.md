# ModelsSessionResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Identity** | [**ClientIdentity**](ClientIdentity.md) |  | 
**Session** | [**ClientSession**](ClientSession.md) |  | 
**Tenant** | Pointer to [**ModelsTenant**](ModelsTenant.md) |  | [optional] 

## Methods

### NewModelsSessionResponse

`func NewModelsSessionResponse(identity ClientIdentity, session ClientSession, ) *ModelsSessionResponse`

NewModelsSessionResponse instantiates a new ModelsSessionResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsSessionResponseWithDefaults

`func NewModelsSessionResponseWithDefaults() *ModelsSessionResponse`

NewModelsSessionResponseWithDefaults instantiates a new ModelsSessionResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetIdentity

`func (o *ModelsSessionResponse) GetIdentity() ClientIdentity`

GetIdentity returns the Identity field if non-nil, zero value otherwise.

### GetIdentityOk

`func (o *ModelsSessionResponse) GetIdentityOk() (*ClientIdentity, bool)`

GetIdentityOk returns a tuple with the Identity field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIdentity

`func (o *ModelsSessionResponse) SetIdentity(v ClientIdentity)`

SetIdentity sets Identity field to given value.


### GetSession

`func (o *ModelsSessionResponse) GetSession() ClientSession`

GetSession returns the Session field if non-nil, zero value otherwise.

### GetSessionOk

`func (o *ModelsSessionResponse) GetSessionOk() (*ClientSession, bool)`

GetSessionOk returns a tuple with the Session field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSession

`func (o *ModelsSessionResponse) SetSession(v ClientSession)`

SetSession sets Session field to given value.


### GetTenant

`func (o *ModelsSessionResponse) GetTenant() ModelsTenant`

GetTenant returns the Tenant field if non-nil, zero value otherwise.

### GetTenantOk

`func (o *ModelsSessionResponse) GetTenantOk() (*ModelsTenant, bool)`

GetTenantOk returns a tuple with the Tenant field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenant

`func (o *ModelsSessionResponse) SetTenant(v ModelsTenant)`

SetTenant sets Tenant field to given value.

### HasTenant

`func (o *ModelsSessionResponse) HasTenant() bool`

HasTenant returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


