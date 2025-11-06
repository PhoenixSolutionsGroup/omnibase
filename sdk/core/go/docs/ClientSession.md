# ClientSession

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Active** | Pointer to **bool** | Active state. If false the session is no longer active. | [optional] 
**AdditionalPropertiesField** | Pointer to **map[string]interface{}** |  | [optional] 
**AuthenticatedAt** | Pointer to **string** | The Session Authentication Timestamp  When this session was authenticated at. If multi-factor authentication was used this is the time when the last factor was authenticated (e.g. the TOTP code challenge was completed). | [optional] 
**AuthenticationMethods** | Pointer to [**[]ClientSessionAuthenticationMethod**](ClientSessionAuthenticationMethod.md) | A list of authenticators which were used to authenticate the session. | [optional] 
**AuthenticatorAssuranceLevel** | Pointer to [**ClientAuthenticatorAssuranceLevel**](ClientAuthenticatorAssuranceLevel.md) |  | [optional] 
**Devices** | Pointer to [**[]ClientSessionDevice**](ClientSessionDevice.md) | Devices has history of all endpoints where the session was used | [optional] 
**ExpiresAt** | Pointer to **string** | The Session Expiry  When this session expires at. | [optional] 
**Id** | Pointer to **string** | Session ID | [optional] 
**Identity** | Pointer to [**ClientIdentity**](ClientIdentity.md) |  | [optional] 
**IssuedAt** | Pointer to **string** | The Session Issuance Timestamp  When this session was issued at. Usually equal or close to &#x60;authenticated_at&#x60;. | [optional] 
**Tokenized** | Pointer to **string** | Tokenized is the tokenized (e.g. JWT) version of the session.  It is only set when the &#x60;tokenize&#x60; query parameter was set to a valid tokenize template during calls to &#x60;/session/whoami&#x60;. | [optional] 

## Methods

### NewClientSession

`func NewClientSession() *ClientSession`

NewClientSession instantiates a new ClientSession object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewClientSessionWithDefaults

`func NewClientSessionWithDefaults() *ClientSession`

NewClientSessionWithDefaults instantiates a new ClientSession object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetActive

`func (o *ClientSession) GetActive() bool`

GetActive returns the Active field if non-nil, zero value otherwise.

### GetActiveOk

`func (o *ClientSession) GetActiveOk() (*bool, bool)`

GetActiveOk returns a tuple with the Active field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetActive

`func (o *ClientSession) SetActive(v bool)`

SetActive sets Active field to given value.

### HasActive

`func (o *ClientSession) HasActive() bool`

HasActive returns a boolean if a field has been set.

### GetAdditionalPropertiesField

`func (o *ClientSession) GetAdditionalPropertiesField() map[string]interface{}`

GetAdditionalPropertiesField returns the AdditionalPropertiesField field if non-nil, zero value otherwise.

### GetAdditionalPropertiesFieldOk

`func (o *ClientSession) GetAdditionalPropertiesFieldOk() (*map[string]interface{}, bool)`

GetAdditionalPropertiesFieldOk returns a tuple with the AdditionalPropertiesField field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAdditionalPropertiesField

`func (o *ClientSession) SetAdditionalPropertiesField(v map[string]interface{})`

SetAdditionalPropertiesField sets AdditionalPropertiesField field to given value.

### HasAdditionalPropertiesField

`func (o *ClientSession) HasAdditionalPropertiesField() bool`

HasAdditionalPropertiesField returns a boolean if a field has been set.

### GetAuthenticatedAt

`func (o *ClientSession) GetAuthenticatedAt() string`

GetAuthenticatedAt returns the AuthenticatedAt field if non-nil, zero value otherwise.

### GetAuthenticatedAtOk

`func (o *ClientSession) GetAuthenticatedAtOk() (*string, bool)`

GetAuthenticatedAtOk returns a tuple with the AuthenticatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAuthenticatedAt

`func (o *ClientSession) SetAuthenticatedAt(v string)`

SetAuthenticatedAt sets AuthenticatedAt field to given value.

### HasAuthenticatedAt

`func (o *ClientSession) HasAuthenticatedAt() bool`

HasAuthenticatedAt returns a boolean if a field has been set.

### GetAuthenticationMethods

`func (o *ClientSession) GetAuthenticationMethods() []ClientSessionAuthenticationMethod`

GetAuthenticationMethods returns the AuthenticationMethods field if non-nil, zero value otherwise.

### GetAuthenticationMethodsOk

`func (o *ClientSession) GetAuthenticationMethodsOk() (*[]ClientSessionAuthenticationMethod, bool)`

GetAuthenticationMethodsOk returns a tuple with the AuthenticationMethods field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAuthenticationMethods

`func (o *ClientSession) SetAuthenticationMethods(v []ClientSessionAuthenticationMethod)`

SetAuthenticationMethods sets AuthenticationMethods field to given value.

### HasAuthenticationMethods

`func (o *ClientSession) HasAuthenticationMethods() bool`

HasAuthenticationMethods returns a boolean if a field has been set.

### GetAuthenticatorAssuranceLevel

`func (o *ClientSession) GetAuthenticatorAssuranceLevel() ClientAuthenticatorAssuranceLevel`

GetAuthenticatorAssuranceLevel returns the AuthenticatorAssuranceLevel field if non-nil, zero value otherwise.

### GetAuthenticatorAssuranceLevelOk

`func (o *ClientSession) GetAuthenticatorAssuranceLevelOk() (*ClientAuthenticatorAssuranceLevel, bool)`

GetAuthenticatorAssuranceLevelOk returns a tuple with the AuthenticatorAssuranceLevel field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAuthenticatorAssuranceLevel

`func (o *ClientSession) SetAuthenticatorAssuranceLevel(v ClientAuthenticatorAssuranceLevel)`

SetAuthenticatorAssuranceLevel sets AuthenticatorAssuranceLevel field to given value.

### HasAuthenticatorAssuranceLevel

`func (o *ClientSession) HasAuthenticatorAssuranceLevel() bool`

HasAuthenticatorAssuranceLevel returns a boolean if a field has been set.

### GetDevices

`func (o *ClientSession) GetDevices() []ClientSessionDevice`

GetDevices returns the Devices field if non-nil, zero value otherwise.

### GetDevicesOk

`func (o *ClientSession) GetDevicesOk() (*[]ClientSessionDevice, bool)`

GetDevicesOk returns a tuple with the Devices field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDevices

`func (o *ClientSession) SetDevices(v []ClientSessionDevice)`

SetDevices sets Devices field to given value.

### HasDevices

`func (o *ClientSession) HasDevices() bool`

HasDevices returns a boolean if a field has been set.

### GetExpiresAt

`func (o *ClientSession) GetExpiresAt() string`

GetExpiresAt returns the ExpiresAt field if non-nil, zero value otherwise.

### GetExpiresAtOk

`func (o *ClientSession) GetExpiresAtOk() (*string, bool)`

GetExpiresAtOk returns a tuple with the ExpiresAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetExpiresAt

`func (o *ClientSession) SetExpiresAt(v string)`

SetExpiresAt sets ExpiresAt field to given value.

### HasExpiresAt

`func (o *ClientSession) HasExpiresAt() bool`

HasExpiresAt returns a boolean if a field has been set.

### GetId

`func (o *ClientSession) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ClientSession) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ClientSession) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *ClientSession) HasId() bool`

HasId returns a boolean if a field has been set.

### GetIdentity

`func (o *ClientSession) GetIdentity() ClientIdentity`

GetIdentity returns the Identity field if non-nil, zero value otherwise.

### GetIdentityOk

`func (o *ClientSession) GetIdentityOk() (*ClientIdentity, bool)`

GetIdentityOk returns a tuple with the Identity field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIdentity

`func (o *ClientSession) SetIdentity(v ClientIdentity)`

SetIdentity sets Identity field to given value.

### HasIdentity

`func (o *ClientSession) HasIdentity() bool`

HasIdentity returns a boolean if a field has been set.

### GetIssuedAt

`func (o *ClientSession) GetIssuedAt() string`

GetIssuedAt returns the IssuedAt field if non-nil, zero value otherwise.

### GetIssuedAtOk

`func (o *ClientSession) GetIssuedAtOk() (*string, bool)`

GetIssuedAtOk returns a tuple with the IssuedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIssuedAt

`func (o *ClientSession) SetIssuedAt(v string)`

SetIssuedAt sets IssuedAt field to given value.

### HasIssuedAt

`func (o *ClientSession) HasIssuedAt() bool`

HasIssuedAt returns a boolean if a field has been set.

### GetTokenized

`func (o *ClientSession) GetTokenized() string`

GetTokenized returns the Tokenized field if non-nil, zero value otherwise.

### GetTokenizedOk

`func (o *ClientSession) GetTokenizedOk() (*string, bool)`

GetTokenizedOk returns a tuple with the Tokenized field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTokenized

`func (o *ClientSession) SetTokenized(v string)`

SetTokenized sets Tokenized field to given value.

### HasTokenized

`func (o *ClientSession) HasTokenized() bool`

HasTokenized returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


