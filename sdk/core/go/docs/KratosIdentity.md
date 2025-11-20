# KratosIdentity

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** | Unique identifier for the identity | 
**SchemaId** | **string** | Identity schema ID | 
**SchemaUrl** | **string** | URL to the identity schema | 
**State** | **string** | Current state of the identity | 
**StateChangedAt** | **time.Time** | Timestamp when state last changed | 
**Traits** | [**KratosIdentityTraits**](KratosIdentityTraits.md) |  | 
**Credentials** | Pointer to [**KratosIdentityCredentials**](KratosIdentityCredentials.md) |  | [optional] 
**VerifiableAddresses** | Pointer to [**[]KratosIdentityVerifiableAddressesInner**](KratosIdentityVerifiableAddressesInner.md) | Email addresses associated with the identity | [optional] 
**RecoveryAddresses** | Pointer to [**[]KratosIdentityRecoveryAddressesInner**](KratosIdentityRecoveryAddressesInner.md) | Recovery email addresses | [optional] 
**OrganizationId** | Pointer to **string** | Organization ID if applicable | [optional] 
**CreatedAt** | **time.Time** | Timestamp when identity was created | 
**UpdatedAt** | **time.Time** | Timestamp when identity was last updated | 

## Methods

### NewKratosIdentity

`func NewKratosIdentity(id string, schemaId string, schemaUrl string, state string, stateChangedAt time.Time, traits KratosIdentityTraits, createdAt time.Time, updatedAt time.Time, ) *KratosIdentity`

NewKratosIdentity instantiates a new KratosIdentity object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewKratosIdentityWithDefaults

`func NewKratosIdentityWithDefaults() *KratosIdentity`

NewKratosIdentityWithDefaults instantiates a new KratosIdentity object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *KratosIdentity) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *KratosIdentity) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *KratosIdentity) SetId(v string)`

SetId sets Id field to given value.


### GetSchemaId

`func (o *KratosIdentity) GetSchemaId() string`

GetSchemaId returns the SchemaId field if non-nil, zero value otherwise.

### GetSchemaIdOk

`func (o *KratosIdentity) GetSchemaIdOk() (*string, bool)`

GetSchemaIdOk returns a tuple with the SchemaId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSchemaId

`func (o *KratosIdentity) SetSchemaId(v string)`

SetSchemaId sets SchemaId field to given value.


### GetSchemaUrl

`func (o *KratosIdentity) GetSchemaUrl() string`

GetSchemaUrl returns the SchemaUrl field if non-nil, zero value otherwise.

### GetSchemaUrlOk

`func (o *KratosIdentity) GetSchemaUrlOk() (*string, bool)`

GetSchemaUrlOk returns a tuple with the SchemaUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSchemaUrl

`func (o *KratosIdentity) SetSchemaUrl(v string)`

SetSchemaUrl sets SchemaUrl field to given value.


### GetState

`func (o *KratosIdentity) GetState() string`

GetState returns the State field if non-nil, zero value otherwise.

### GetStateOk

`func (o *KratosIdentity) GetStateOk() (*string, bool)`

GetStateOk returns a tuple with the State field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetState

`func (o *KratosIdentity) SetState(v string)`

SetState sets State field to given value.


### GetStateChangedAt

`func (o *KratosIdentity) GetStateChangedAt() time.Time`

GetStateChangedAt returns the StateChangedAt field if non-nil, zero value otherwise.

### GetStateChangedAtOk

`func (o *KratosIdentity) GetStateChangedAtOk() (*time.Time, bool)`

GetStateChangedAtOk returns a tuple with the StateChangedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStateChangedAt

`func (o *KratosIdentity) SetStateChangedAt(v time.Time)`

SetStateChangedAt sets StateChangedAt field to given value.


### GetTraits

`func (o *KratosIdentity) GetTraits() KratosIdentityTraits`

GetTraits returns the Traits field if non-nil, zero value otherwise.

### GetTraitsOk

`func (o *KratosIdentity) GetTraitsOk() (*KratosIdentityTraits, bool)`

GetTraitsOk returns a tuple with the Traits field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTraits

`func (o *KratosIdentity) SetTraits(v KratosIdentityTraits)`

SetTraits sets Traits field to given value.


### GetCredentials

`func (o *KratosIdentity) GetCredentials() KratosIdentityCredentials`

GetCredentials returns the Credentials field if non-nil, zero value otherwise.

### GetCredentialsOk

`func (o *KratosIdentity) GetCredentialsOk() (*KratosIdentityCredentials, bool)`

GetCredentialsOk returns a tuple with the Credentials field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCredentials

`func (o *KratosIdentity) SetCredentials(v KratosIdentityCredentials)`

SetCredentials sets Credentials field to given value.

### HasCredentials

`func (o *KratosIdentity) HasCredentials() bool`

HasCredentials returns a boolean if a field has been set.

### GetVerifiableAddresses

`func (o *KratosIdentity) GetVerifiableAddresses() []KratosIdentityVerifiableAddressesInner`

GetVerifiableAddresses returns the VerifiableAddresses field if non-nil, zero value otherwise.

### GetVerifiableAddressesOk

`func (o *KratosIdentity) GetVerifiableAddressesOk() (*[]KratosIdentityVerifiableAddressesInner, bool)`

GetVerifiableAddressesOk returns a tuple with the VerifiableAddresses field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVerifiableAddresses

`func (o *KratosIdentity) SetVerifiableAddresses(v []KratosIdentityVerifiableAddressesInner)`

SetVerifiableAddresses sets VerifiableAddresses field to given value.

### HasVerifiableAddresses

`func (o *KratosIdentity) HasVerifiableAddresses() bool`

HasVerifiableAddresses returns a boolean if a field has been set.

### GetRecoveryAddresses

`func (o *KratosIdentity) GetRecoveryAddresses() []KratosIdentityRecoveryAddressesInner`

GetRecoveryAddresses returns the RecoveryAddresses field if non-nil, zero value otherwise.

### GetRecoveryAddressesOk

`func (o *KratosIdentity) GetRecoveryAddressesOk() (*[]KratosIdentityRecoveryAddressesInner, bool)`

GetRecoveryAddressesOk returns a tuple with the RecoveryAddresses field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRecoveryAddresses

`func (o *KratosIdentity) SetRecoveryAddresses(v []KratosIdentityRecoveryAddressesInner)`

SetRecoveryAddresses sets RecoveryAddresses field to given value.

### HasRecoveryAddresses

`func (o *KratosIdentity) HasRecoveryAddresses() bool`

HasRecoveryAddresses returns a boolean if a field has been set.

### GetOrganizationId

`func (o *KratosIdentity) GetOrganizationId() string`

GetOrganizationId returns the OrganizationId field if non-nil, zero value otherwise.

### GetOrganizationIdOk

`func (o *KratosIdentity) GetOrganizationIdOk() (*string, bool)`

GetOrganizationIdOk returns a tuple with the OrganizationId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetOrganizationId

`func (o *KratosIdentity) SetOrganizationId(v string)`

SetOrganizationId sets OrganizationId field to given value.

### HasOrganizationId

`func (o *KratosIdentity) HasOrganizationId() bool`

HasOrganizationId returns a boolean if a field has been set.

### GetCreatedAt

`func (o *KratosIdentity) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *KratosIdentity) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *KratosIdentity) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.


### GetUpdatedAt

`func (o *KratosIdentity) GetUpdatedAt() time.Time`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *KratosIdentity) GetUpdatedAtOk() (*time.Time, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *KratosIdentity) SetUpdatedAt(v time.Time)`

SetUpdatedAt sets UpdatedAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


