# SessionResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Session** | **map[string]interface{}** | Kratos session metadata | 
**Identity** | **map[string]interface{}** | User identity information | 
**Tenant** | Pointer to [**Tenant**](Tenant.md) | Active tenant context (if user has tenant membership) | [optional] 

## Methods

### NewSessionResponse

`func NewSessionResponse(session map[string]interface{}, identity map[string]interface{}, ) *SessionResponse`

NewSessionResponse instantiates a new SessionResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSessionResponseWithDefaults

`func NewSessionResponseWithDefaults() *SessionResponse`

NewSessionResponseWithDefaults instantiates a new SessionResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetSession

`func (o *SessionResponse) GetSession() map[string]interface{}`

GetSession returns the Session field if non-nil, zero value otherwise.

### GetSessionOk

`func (o *SessionResponse) GetSessionOk() (*map[string]interface{}, bool)`

GetSessionOk returns a tuple with the Session field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSession

`func (o *SessionResponse) SetSession(v map[string]interface{})`

SetSession sets Session field to given value.


### GetIdentity

`func (o *SessionResponse) GetIdentity() map[string]interface{}`

GetIdentity returns the Identity field if non-nil, zero value otherwise.

### GetIdentityOk

`func (o *SessionResponse) GetIdentityOk() (*map[string]interface{}, bool)`

GetIdentityOk returns a tuple with the Identity field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIdentity

`func (o *SessionResponse) SetIdentity(v map[string]interface{})`

SetIdentity sets Identity field to given value.


### GetTenant

`func (o *SessionResponse) GetTenant() Tenant`

GetTenant returns the Tenant field if non-nil, zero value otherwise.

### GetTenantOk

`func (o *SessionResponse) GetTenantOk() (*Tenant, bool)`

GetTenantOk returns a tuple with the Tenant field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenant

`func (o *SessionResponse) SetTenant(v Tenant)`

SetTenant sets Tenant field to given value.

### HasTenant

`func (o *SessionResponse) HasTenant() bool`

HasTenant returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


