# Session

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**AdditionalPropertiesField** | Pointer to **map[string]interface{}** |  | [optional] 
**Active** | Pointer to **bool** |  | [optional] 
**AuthenticatedAt** | Pointer to **time.Time** |  | [optional] 
**AuthenticationMethods** | Pointer to [**[]SessionAuthenticationMethod**](SessionAuthenticationMethod.md) |  | [optional] 
**AuthenticatorAssuranceLevel** | Pointer to **string** |  | [optional] 
**Devices** | Pointer to [**[]SessionDevice**](SessionDevice.md) |  | [optional] 
**ExpiresAt** | Pointer to **time.Time** |  | [optional] 
**Id** | **string** |  | 
**Identity** | Pointer to [**Identity**](Identity.md) |  | [optional] 
**IssuedAt** | Pointer to **time.Time** |  | [optional] 
**Tokenized** | Pointer to **string** |  | [optional] 

## Methods

### NewSession

`func NewSession(id string, ) *Session`

NewSession instantiates a new Session object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSessionWithDefaults

`func NewSessionWithDefaults() *Session`

NewSessionWithDefaults instantiates a new Session object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAdditionalPropertiesField

`func (o *Session) GetAdditionalPropertiesField() map[string]interface{}`

GetAdditionalPropertiesField returns the AdditionalPropertiesField field if non-nil, zero value otherwise.

### GetAdditionalPropertiesFieldOk

`func (o *Session) GetAdditionalPropertiesFieldOk() (*map[string]interface{}, bool)`

GetAdditionalPropertiesFieldOk returns a tuple with the AdditionalPropertiesField field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAdditionalPropertiesField

`func (o *Session) SetAdditionalPropertiesField(v map[string]interface{})`

SetAdditionalPropertiesField sets AdditionalPropertiesField field to given value.

### HasAdditionalPropertiesField

`func (o *Session) HasAdditionalPropertiesField() bool`

HasAdditionalPropertiesField returns a boolean if a field has been set.

### GetActive

`func (o *Session) GetActive() bool`

GetActive returns the Active field if non-nil, zero value otherwise.

### GetActiveOk

`func (o *Session) GetActiveOk() (*bool, bool)`

GetActiveOk returns a tuple with the Active field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetActive

`func (o *Session) SetActive(v bool)`

SetActive sets Active field to given value.

### HasActive

`func (o *Session) HasActive() bool`

HasActive returns a boolean if a field has been set.

### GetAuthenticatedAt

`func (o *Session) GetAuthenticatedAt() time.Time`

GetAuthenticatedAt returns the AuthenticatedAt field if non-nil, zero value otherwise.

### GetAuthenticatedAtOk

`func (o *Session) GetAuthenticatedAtOk() (*time.Time, bool)`

GetAuthenticatedAtOk returns a tuple with the AuthenticatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAuthenticatedAt

`func (o *Session) SetAuthenticatedAt(v time.Time)`

SetAuthenticatedAt sets AuthenticatedAt field to given value.

### HasAuthenticatedAt

`func (o *Session) HasAuthenticatedAt() bool`

HasAuthenticatedAt returns a boolean if a field has been set.

### GetAuthenticationMethods

`func (o *Session) GetAuthenticationMethods() []SessionAuthenticationMethod`

GetAuthenticationMethods returns the AuthenticationMethods field if non-nil, zero value otherwise.

### GetAuthenticationMethodsOk

`func (o *Session) GetAuthenticationMethodsOk() (*[]SessionAuthenticationMethod, bool)`

GetAuthenticationMethodsOk returns a tuple with the AuthenticationMethods field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAuthenticationMethods

`func (o *Session) SetAuthenticationMethods(v []SessionAuthenticationMethod)`

SetAuthenticationMethods sets AuthenticationMethods field to given value.

### HasAuthenticationMethods

`func (o *Session) HasAuthenticationMethods() bool`

HasAuthenticationMethods returns a boolean if a field has been set.

### SetAuthenticationMethodsNil

`func (o *Session) SetAuthenticationMethodsNil(b bool)`

 SetAuthenticationMethodsNil sets the value for AuthenticationMethods to be an explicit nil

### UnsetAuthenticationMethods
`func (o *Session) UnsetAuthenticationMethods()`

UnsetAuthenticationMethods ensures that no value is present for AuthenticationMethods, not even an explicit nil
### GetAuthenticatorAssuranceLevel

`func (o *Session) GetAuthenticatorAssuranceLevel() string`

GetAuthenticatorAssuranceLevel returns the AuthenticatorAssuranceLevel field if non-nil, zero value otherwise.

### GetAuthenticatorAssuranceLevelOk

`func (o *Session) GetAuthenticatorAssuranceLevelOk() (*string, bool)`

GetAuthenticatorAssuranceLevelOk returns a tuple with the AuthenticatorAssuranceLevel field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAuthenticatorAssuranceLevel

`func (o *Session) SetAuthenticatorAssuranceLevel(v string)`

SetAuthenticatorAssuranceLevel sets AuthenticatorAssuranceLevel field to given value.

### HasAuthenticatorAssuranceLevel

`func (o *Session) HasAuthenticatorAssuranceLevel() bool`

HasAuthenticatorAssuranceLevel returns a boolean if a field has been set.

### GetDevices

`func (o *Session) GetDevices() []SessionDevice`

GetDevices returns the Devices field if non-nil, zero value otherwise.

### GetDevicesOk

`func (o *Session) GetDevicesOk() (*[]SessionDevice, bool)`

GetDevicesOk returns a tuple with the Devices field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDevices

`func (o *Session) SetDevices(v []SessionDevice)`

SetDevices sets Devices field to given value.

### HasDevices

`func (o *Session) HasDevices() bool`

HasDevices returns a boolean if a field has been set.

### SetDevicesNil

`func (o *Session) SetDevicesNil(b bool)`

 SetDevicesNil sets the value for Devices to be an explicit nil

### UnsetDevices
`func (o *Session) UnsetDevices()`

UnsetDevices ensures that no value is present for Devices, not even an explicit nil
### GetExpiresAt

`func (o *Session) GetExpiresAt() time.Time`

GetExpiresAt returns the ExpiresAt field if non-nil, zero value otherwise.

### GetExpiresAtOk

`func (o *Session) GetExpiresAtOk() (*time.Time, bool)`

GetExpiresAtOk returns a tuple with the ExpiresAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetExpiresAt

`func (o *Session) SetExpiresAt(v time.Time)`

SetExpiresAt sets ExpiresAt field to given value.

### HasExpiresAt

`func (o *Session) HasExpiresAt() bool`

HasExpiresAt returns a boolean if a field has been set.

### GetId

`func (o *Session) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *Session) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *Session) SetId(v string)`

SetId sets Id field to given value.


### GetIdentity

`func (o *Session) GetIdentity() Identity`

GetIdentity returns the Identity field if non-nil, zero value otherwise.

### GetIdentityOk

`func (o *Session) GetIdentityOk() (*Identity, bool)`

GetIdentityOk returns a tuple with the Identity field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIdentity

`func (o *Session) SetIdentity(v Identity)`

SetIdentity sets Identity field to given value.

### HasIdentity

`func (o *Session) HasIdentity() bool`

HasIdentity returns a boolean if a field has been set.

### GetIssuedAt

`func (o *Session) GetIssuedAt() time.Time`

GetIssuedAt returns the IssuedAt field if non-nil, zero value otherwise.

### GetIssuedAtOk

`func (o *Session) GetIssuedAtOk() (*time.Time, bool)`

GetIssuedAtOk returns a tuple with the IssuedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIssuedAt

`func (o *Session) SetIssuedAt(v time.Time)`

SetIssuedAt sets IssuedAt field to given value.

### HasIssuedAt

`func (o *Session) HasIssuedAt() bool`

HasIssuedAt returns a boolean if a field has been set.

### GetTokenized

`func (o *Session) GetTokenized() string`

GetTokenized returns the Tokenized field if non-nil, zero value otherwise.

### GetTokenizedOk

`func (o *Session) GetTokenizedOk() (*string, bool)`

GetTokenizedOk returns a tuple with the Tokenized field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTokenized

`func (o *Session) SetTokenized(v string)`

SetTokenized sets Tokenized field to given value.

### HasTokenized

`func (o *Session) HasTokenized() bool`

HasTokenized returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


