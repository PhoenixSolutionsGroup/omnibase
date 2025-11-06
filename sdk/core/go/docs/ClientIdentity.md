# ClientIdentity

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**AdditionalPropertiesField** | Pointer to **map[string]interface{}** |  | [optional] 
**CreatedAt** | Pointer to **string** | CreatedAt is a helper struct field for gobuffalo.pop. | [optional] 
**Credentials** | Pointer to [**map[string]ClientIdentityCredentials**](ClientIdentityCredentials.md) | Credentials represents all credentials that can be used for authenticating this identity. | [optional] 
**Id** | Pointer to **string** | ID is the identity&#39;s unique identifier.  The Identity ID can not be changed and can not be chosen. This ensures future compatibility and optimization for distributed stores such as CockroachDB. | [optional] 
**MetadataAdmin** | Pointer to **map[string]interface{}** | NullJSONRawMessage represents a json.RawMessage that works well with JSON, SQL, and Swagger and is NULLable- | [optional] 
**MetadataPublic** | Pointer to **map[string]interface{}** | NullJSONRawMessage represents a json.RawMessage that works well with JSON, SQL, and Swagger and is NULLable- | [optional] 
**OrganizationId** | Pointer to **map[string]interface{}** |  | [optional] 
**RecoveryAddresses** | Pointer to [**[]ClientRecoveryIdentityAddress**](ClientRecoveryIdentityAddress.md) | RecoveryAddresses contains all the addresses that can be used to recover an identity. | [optional] 
**SchemaId** | Pointer to **string** | SchemaID is the ID of the JSON Schema to be used for validating the identity&#39;s traits. | [optional] 
**SchemaUrl** | Pointer to **string** | SchemaURL is the URL of the endpoint where the identity&#39;s traits schema can be fetched from.  format: url | [optional] 
**State** | Pointer to **string** | State is the identity&#39;s state.  This value has currently no effect. active StateActive inactive StateInactive | [optional] 
**StateChangedAt** | Pointer to **string** |  | [optional] 
**Traits** | Pointer to **map[string]interface{}** | Traits represent an identity&#39;s traits. The identity is able to create, modify, and delete traits in a self-service manner. The input will always be validated against the JSON Schema defined in &#x60;schema_url&#x60;. | [optional] 
**UpdatedAt** | Pointer to **string** | UpdatedAt is a helper struct field for gobuffalo.pop. | [optional] 
**VerifiableAddresses** | Pointer to [**[]ClientVerifiableIdentityAddress**](ClientVerifiableIdentityAddress.md) | VerifiableAddresses contains all the addresses that can be verified by the user. | [optional] 

## Methods

### NewClientIdentity

`func NewClientIdentity() *ClientIdentity`

NewClientIdentity instantiates a new ClientIdentity object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewClientIdentityWithDefaults

`func NewClientIdentityWithDefaults() *ClientIdentity`

NewClientIdentityWithDefaults instantiates a new ClientIdentity object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAdditionalPropertiesField

`func (o *ClientIdentity) GetAdditionalPropertiesField() map[string]interface{}`

GetAdditionalPropertiesField returns the AdditionalPropertiesField field if non-nil, zero value otherwise.

### GetAdditionalPropertiesFieldOk

`func (o *ClientIdentity) GetAdditionalPropertiesFieldOk() (*map[string]interface{}, bool)`

GetAdditionalPropertiesFieldOk returns a tuple with the AdditionalPropertiesField field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAdditionalPropertiesField

`func (o *ClientIdentity) SetAdditionalPropertiesField(v map[string]interface{})`

SetAdditionalPropertiesField sets AdditionalPropertiesField field to given value.

### HasAdditionalPropertiesField

`func (o *ClientIdentity) HasAdditionalPropertiesField() bool`

HasAdditionalPropertiesField returns a boolean if a field has been set.

### GetCreatedAt

`func (o *ClientIdentity) GetCreatedAt() string`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *ClientIdentity) GetCreatedAtOk() (*string, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *ClientIdentity) SetCreatedAt(v string)`

SetCreatedAt sets CreatedAt field to given value.

### HasCreatedAt

`func (o *ClientIdentity) HasCreatedAt() bool`

HasCreatedAt returns a boolean if a field has been set.

### GetCredentials

`func (o *ClientIdentity) GetCredentials() map[string]ClientIdentityCredentials`

GetCredentials returns the Credentials field if non-nil, zero value otherwise.

### GetCredentialsOk

`func (o *ClientIdentity) GetCredentialsOk() (*map[string]ClientIdentityCredentials, bool)`

GetCredentialsOk returns a tuple with the Credentials field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCredentials

`func (o *ClientIdentity) SetCredentials(v map[string]ClientIdentityCredentials)`

SetCredentials sets Credentials field to given value.

### HasCredentials

`func (o *ClientIdentity) HasCredentials() bool`

HasCredentials returns a boolean if a field has been set.

### GetId

`func (o *ClientIdentity) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ClientIdentity) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ClientIdentity) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *ClientIdentity) HasId() bool`

HasId returns a boolean if a field has been set.

### GetMetadataAdmin

`func (o *ClientIdentity) GetMetadataAdmin() map[string]interface{}`

GetMetadataAdmin returns the MetadataAdmin field if non-nil, zero value otherwise.

### GetMetadataAdminOk

`func (o *ClientIdentity) GetMetadataAdminOk() (*map[string]interface{}, bool)`

GetMetadataAdminOk returns a tuple with the MetadataAdmin field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMetadataAdmin

`func (o *ClientIdentity) SetMetadataAdmin(v map[string]interface{})`

SetMetadataAdmin sets MetadataAdmin field to given value.

### HasMetadataAdmin

`func (o *ClientIdentity) HasMetadataAdmin() bool`

HasMetadataAdmin returns a boolean if a field has been set.

### GetMetadataPublic

`func (o *ClientIdentity) GetMetadataPublic() map[string]interface{}`

GetMetadataPublic returns the MetadataPublic field if non-nil, zero value otherwise.

### GetMetadataPublicOk

`func (o *ClientIdentity) GetMetadataPublicOk() (*map[string]interface{}, bool)`

GetMetadataPublicOk returns a tuple with the MetadataPublic field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMetadataPublic

`func (o *ClientIdentity) SetMetadataPublic(v map[string]interface{})`

SetMetadataPublic sets MetadataPublic field to given value.

### HasMetadataPublic

`func (o *ClientIdentity) HasMetadataPublic() bool`

HasMetadataPublic returns a boolean if a field has been set.

### GetOrganizationId

`func (o *ClientIdentity) GetOrganizationId() map[string]interface{}`

GetOrganizationId returns the OrganizationId field if non-nil, zero value otherwise.

### GetOrganizationIdOk

`func (o *ClientIdentity) GetOrganizationIdOk() (*map[string]interface{}, bool)`

GetOrganizationIdOk returns a tuple with the OrganizationId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetOrganizationId

`func (o *ClientIdentity) SetOrganizationId(v map[string]interface{})`

SetOrganizationId sets OrganizationId field to given value.

### HasOrganizationId

`func (o *ClientIdentity) HasOrganizationId() bool`

HasOrganizationId returns a boolean if a field has been set.

### GetRecoveryAddresses

`func (o *ClientIdentity) GetRecoveryAddresses() []ClientRecoveryIdentityAddress`

GetRecoveryAddresses returns the RecoveryAddresses field if non-nil, zero value otherwise.

### GetRecoveryAddressesOk

`func (o *ClientIdentity) GetRecoveryAddressesOk() (*[]ClientRecoveryIdentityAddress, bool)`

GetRecoveryAddressesOk returns a tuple with the RecoveryAddresses field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRecoveryAddresses

`func (o *ClientIdentity) SetRecoveryAddresses(v []ClientRecoveryIdentityAddress)`

SetRecoveryAddresses sets RecoveryAddresses field to given value.

### HasRecoveryAddresses

`func (o *ClientIdentity) HasRecoveryAddresses() bool`

HasRecoveryAddresses returns a boolean if a field has been set.

### GetSchemaId

`func (o *ClientIdentity) GetSchemaId() string`

GetSchemaId returns the SchemaId field if non-nil, zero value otherwise.

### GetSchemaIdOk

`func (o *ClientIdentity) GetSchemaIdOk() (*string, bool)`

GetSchemaIdOk returns a tuple with the SchemaId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSchemaId

`func (o *ClientIdentity) SetSchemaId(v string)`

SetSchemaId sets SchemaId field to given value.

### HasSchemaId

`func (o *ClientIdentity) HasSchemaId() bool`

HasSchemaId returns a boolean if a field has been set.

### GetSchemaUrl

`func (o *ClientIdentity) GetSchemaUrl() string`

GetSchemaUrl returns the SchemaUrl field if non-nil, zero value otherwise.

### GetSchemaUrlOk

`func (o *ClientIdentity) GetSchemaUrlOk() (*string, bool)`

GetSchemaUrlOk returns a tuple with the SchemaUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSchemaUrl

`func (o *ClientIdentity) SetSchemaUrl(v string)`

SetSchemaUrl sets SchemaUrl field to given value.

### HasSchemaUrl

`func (o *ClientIdentity) HasSchemaUrl() bool`

HasSchemaUrl returns a boolean if a field has been set.

### GetState

`func (o *ClientIdentity) GetState() string`

GetState returns the State field if non-nil, zero value otherwise.

### GetStateOk

`func (o *ClientIdentity) GetStateOk() (*string, bool)`

GetStateOk returns a tuple with the State field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetState

`func (o *ClientIdentity) SetState(v string)`

SetState sets State field to given value.

### HasState

`func (o *ClientIdentity) HasState() bool`

HasState returns a boolean if a field has been set.

### GetStateChangedAt

`func (o *ClientIdentity) GetStateChangedAt() string`

GetStateChangedAt returns the StateChangedAt field if non-nil, zero value otherwise.

### GetStateChangedAtOk

`func (o *ClientIdentity) GetStateChangedAtOk() (*string, bool)`

GetStateChangedAtOk returns a tuple with the StateChangedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStateChangedAt

`func (o *ClientIdentity) SetStateChangedAt(v string)`

SetStateChangedAt sets StateChangedAt field to given value.

### HasStateChangedAt

`func (o *ClientIdentity) HasStateChangedAt() bool`

HasStateChangedAt returns a boolean if a field has been set.

### GetTraits

`func (o *ClientIdentity) GetTraits() map[string]interface{}`

GetTraits returns the Traits field if non-nil, zero value otherwise.

### GetTraitsOk

`func (o *ClientIdentity) GetTraitsOk() (*map[string]interface{}, bool)`

GetTraitsOk returns a tuple with the Traits field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTraits

`func (o *ClientIdentity) SetTraits(v map[string]interface{})`

SetTraits sets Traits field to given value.

### HasTraits

`func (o *ClientIdentity) HasTraits() bool`

HasTraits returns a boolean if a field has been set.

### GetUpdatedAt

`func (o *ClientIdentity) GetUpdatedAt() string`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *ClientIdentity) GetUpdatedAtOk() (*string, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *ClientIdentity) SetUpdatedAt(v string)`

SetUpdatedAt sets UpdatedAt field to given value.

### HasUpdatedAt

`func (o *ClientIdentity) HasUpdatedAt() bool`

HasUpdatedAt returns a boolean if a field has been set.

### GetVerifiableAddresses

`func (o *ClientIdentity) GetVerifiableAddresses() []ClientVerifiableIdentityAddress`

GetVerifiableAddresses returns the VerifiableAddresses field if non-nil, zero value otherwise.

### GetVerifiableAddressesOk

`func (o *ClientIdentity) GetVerifiableAddressesOk() (*[]ClientVerifiableIdentityAddress, bool)`

GetVerifiableAddressesOk returns a tuple with the VerifiableAddresses field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVerifiableAddresses

`func (o *ClientIdentity) SetVerifiableAddresses(v []ClientVerifiableIdentityAddress)`

SetVerifiableAddresses sets VerifiableAddresses field to given value.

### HasVerifiableAddresses

`func (o *ClientIdentity) HasVerifiableAddresses() bool`

HasVerifiableAddresses returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


