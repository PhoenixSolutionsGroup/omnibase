# ClientIdentityCredentials

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**AdditionalPropertiesField** | Pointer to **map[string]interface{}** |  | [optional] 
**Config** | Pointer to **map[string]interface{}** |  | [optional] 
**CreatedAt** | Pointer to **string** | CreatedAt is a helper struct field for gobuffalo.pop. | [optional] 
**Identifiers** | Pointer to **[]string** | Identifiers represents a list of unique identifiers this credential type matches. | [optional] 
**Type** | Pointer to **string** | Type discriminates between different types of credentials. password CredentialsTypePassword oidc CredentialsTypeOIDC totp CredentialsTypeTOTP lookup_secret CredentialsTypeLookup webauthn CredentialsTypeWebAuthn code CredentialsTypeCodeAuth passkey CredentialsTypePasskey profile CredentialsTypeProfile saml CredentialsTypeSAML link_recovery CredentialsTypeRecoveryLink  CredentialsTypeRecoveryLink is a special credential type linked to the link strategy (recovery flow).  It is not used within the credentials object itself. code_recovery CredentialsTypeRecoveryCode | [optional] 
**UpdatedAt** | Pointer to **string** | UpdatedAt is a helper struct field for gobuffalo.pop. | [optional] 
**Version** | Pointer to **int32** | Version refers to the version of the credential. Useful when changing the config schema. | [optional] 

## Methods

### NewClientIdentityCredentials

`func NewClientIdentityCredentials() *ClientIdentityCredentials`

NewClientIdentityCredentials instantiates a new ClientIdentityCredentials object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewClientIdentityCredentialsWithDefaults

`func NewClientIdentityCredentialsWithDefaults() *ClientIdentityCredentials`

NewClientIdentityCredentialsWithDefaults instantiates a new ClientIdentityCredentials object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAdditionalPropertiesField

`func (o *ClientIdentityCredentials) GetAdditionalPropertiesField() map[string]interface{}`

GetAdditionalPropertiesField returns the AdditionalPropertiesField field if non-nil, zero value otherwise.

### GetAdditionalPropertiesFieldOk

`func (o *ClientIdentityCredentials) GetAdditionalPropertiesFieldOk() (*map[string]interface{}, bool)`

GetAdditionalPropertiesFieldOk returns a tuple with the AdditionalPropertiesField field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAdditionalPropertiesField

`func (o *ClientIdentityCredentials) SetAdditionalPropertiesField(v map[string]interface{})`

SetAdditionalPropertiesField sets AdditionalPropertiesField field to given value.

### HasAdditionalPropertiesField

`func (o *ClientIdentityCredentials) HasAdditionalPropertiesField() bool`

HasAdditionalPropertiesField returns a boolean if a field has been set.

### GetConfig

`func (o *ClientIdentityCredentials) GetConfig() map[string]interface{}`

GetConfig returns the Config field if non-nil, zero value otherwise.

### GetConfigOk

`func (o *ClientIdentityCredentials) GetConfigOk() (*map[string]interface{}, bool)`

GetConfigOk returns a tuple with the Config field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfig

`func (o *ClientIdentityCredentials) SetConfig(v map[string]interface{})`

SetConfig sets Config field to given value.

### HasConfig

`func (o *ClientIdentityCredentials) HasConfig() bool`

HasConfig returns a boolean if a field has been set.

### GetCreatedAt

`func (o *ClientIdentityCredentials) GetCreatedAt() string`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *ClientIdentityCredentials) GetCreatedAtOk() (*string, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *ClientIdentityCredentials) SetCreatedAt(v string)`

SetCreatedAt sets CreatedAt field to given value.

### HasCreatedAt

`func (o *ClientIdentityCredentials) HasCreatedAt() bool`

HasCreatedAt returns a boolean if a field has been set.

### GetIdentifiers

`func (o *ClientIdentityCredentials) GetIdentifiers() []string`

GetIdentifiers returns the Identifiers field if non-nil, zero value otherwise.

### GetIdentifiersOk

`func (o *ClientIdentityCredentials) GetIdentifiersOk() (*[]string, bool)`

GetIdentifiersOk returns a tuple with the Identifiers field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIdentifiers

`func (o *ClientIdentityCredentials) SetIdentifiers(v []string)`

SetIdentifiers sets Identifiers field to given value.

### HasIdentifiers

`func (o *ClientIdentityCredentials) HasIdentifiers() bool`

HasIdentifiers returns a boolean if a field has been set.

### GetType

`func (o *ClientIdentityCredentials) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *ClientIdentityCredentials) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *ClientIdentityCredentials) SetType(v string)`

SetType sets Type field to given value.

### HasType

`func (o *ClientIdentityCredentials) HasType() bool`

HasType returns a boolean if a field has been set.

### GetUpdatedAt

`func (o *ClientIdentityCredentials) GetUpdatedAt() string`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *ClientIdentityCredentials) GetUpdatedAtOk() (*string, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *ClientIdentityCredentials) SetUpdatedAt(v string)`

SetUpdatedAt sets UpdatedAt field to given value.

### HasUpdatedAt

`func (o *ClientIdentityCredentials) HasUpdatedAt() bool`

HasUpdatedAt returns a boolean if a field has been set.

### GetVersion

`func (o *ClientIdentityCredentials) GetVersion() int32`

GetVersion returns the Version field if non-nil, zero value otherwise.

### GetVersionOk

`func (o *ClientIdentityCredentials) GetVersionOk() (*int32, bool)`

GetVersionOk returns a tuple with the Version field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVersion

`func (o *ClientIdentityCredentials) SetVersion(v int32)`

SetVersion sets Version field to given value.

### HasVersion

`func (o *ClientIdentityCredentials) HasVersion() bool`

HasVersion returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


