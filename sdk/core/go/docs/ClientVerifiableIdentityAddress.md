# ClientVerifiableIdentityAddress

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**AdditionalPropertiesField** | Pointer to **map[string]interface{}** |  | [optional] 
**CreatedAt** | Pointer to **string** | When this entry was created | [optional] 
**Id** | Pointer to **string** | The ID | [optional] 
**Status** | Pointer to **string** | VerifiableAddressStatus must not exceed 16 characters as that is the limitation in the SQL Schema | [optional] 
**UpdatedAt** | Pointer to **string** | When this entry was last updated | [optional] 
**Value** | Pointer to **string** | The address value  example foo@user.com | [optional] 
**Verified** | Pointer to **bool** | Indicates if the address has already been verified | [optional] 
**VerifiedAt** | Pointer to **string** |  | [optional] 
**Via** | Pointer to **string** | The delivery method | [optional] 

## Methods

### NewClientVerifiableIdentityAddress

`func NewClientVerifiableIdentityAddress() *ClientVerifiableIdentityAddress`

NewClientVerifiableIdentityAddress instantiates a new ClientVerifiableIdentityAddress object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewClientVerifiableIdentityAddressWithDefaults

`func NewClientVerifiableIdentityAddressWithDefaults() *ClientVerifiableIdentityAddress`

NewClientVerifiableIdentityAddressWithDefaults instantiates a new ClientVerifiableIdentityAddress object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAdditionalPropertiesField

`func (o *ClientVerifiableIdentityAddress) GetAdditionalPropertiesField() map[string]interface{}`

GetAdditionalPropertiesField returns the AdditionalPropertiesField field if non-nil, zero value otherwise.

### GetAdditionalPropertiesFieldOk

`func (o *ClientVerifiableIdentityAddress) GetAdditionalPropertiesFieldOk() (*map[string]interface{}, bool)`

GetAdditionalPropertiesFieldOk returns a tuple with the AdditionalPropertiesField field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAdditionalPropertiesField

`func (o *ClientVerifiableIdentityAddress) SetAdditionalPropertiesField(v map[string]interface{})`

SetAdditionalPropertiesField sets AdditionalPropertiesField field to given value.

### HasAdditionalPropertiesField

`func (o *ClientVerifiableIdentityAddress) HasAdditionalPropertiesField() bool`

HasAdditionalPropertiesField returns a boolean if a field has been set.

### GetCreatedAt

`func (o *ClientVerifiableIdentityAddress) GetCreatedAt() string`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *ClientVerifiableIdentityAddress) GetCreatedAtOk() (*string, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *ClientVerifiableIdentityAddress) SetCreatedAt(v string)`

SetCreatedAt sets CreatedAt field to given value.

### HasCreatedAt

`func (o *ClientVerifiableIdentityAddress) HasCreatedAt() bool`

HasCreatedAt returns a boolean if a field has been set.

### GetId

`func (o *ClientVerifiableIdentityAddress) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ClientVerifiableIdentityAddress) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ClientVerifiableIdentityAddress) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *ClientVerifiableIdentityAddress) HasId() bool`

HasId returns a boolean if a field has been set.

### GetStatus

`func (o *ClientVerifiableIdentityAddress) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *ClientVerifiableIdentityAddress) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *ClientVerifiableIdentityAddress) SetStatus(v string)`

SetStatus sets Status field to given value.

### HasStatus

`func (o *ClientVerifiableIdentityAddress) HasStatus() bool`

HasStatus returns a boolean if a field has been set.

### GetUpdatedAt

`func (o *ClientVerifiableIdentityAddress) GetUpdatedAt() string`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *ClientVerifiableIdentityAddress) GetUpdatedAtOk() (*string, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *ClientVerifiableIdentityAddress) SetUpdatedAt(v string)`

SetUpdatedAt sets UpdatedAt field to given value.

### HasUpdatedAt

`func (o *ClientVerifiableIdentityAddress) HasUpdatedAt() bool`

HasUpdatedAt returns a boolean if a field has been set.

### GetValue

`func (o *ClientVerifiableIdentityAddress) GetValue() string`

GetValue returns the Value field if non-nil, zero value otherwise.

### GetValueOk

`func (o *ClientVerifiableIdentityAddress) GetValueOk() (*string, bool)`

GetValueOk returns a tuple with the Value field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetValue

`func (o *ClientVerifiableIdentityAddress) SetValue(v string)`

SetValue sets Value field to given value.

### HasValue

`func (o *ClientVerifiableIdentityAddress) HasValue() bool`

HasValue returns a boolean if a field has been set.

### GetVerified

`func (o *ClientVerifiableIdentityAddress) GetVerified() bool`

GetVerified returns the Verified field if non-nil, zero value otherwise.

### GetVerifiedOk

`func (o *ClientVerifiableIdentityAddress) GetVerifiedOk() (*bool, bool)`

GetVerifiedOk returns a tuple with the Verified field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVerified

`func (o *ClientVerifiableIdentityAddress) SetVerified(v bool)`

SetVerified sets Verified field to given value.

### HasVerified

`func (o *ClientVerifiableIdentityAddress) HasVerified() bool`

HasVerified returns a boolean if a field has been set.

### GetVerifiedAt

`func (o *ClientVerifiableIdentityAddress) GetVerifiedAt() string`

GetVerifiedAt returns the VerifiedAt field if non-nil, zero value otherwise.

### GetVerifiedAtOk

`func (o *ClientVerifiableIdentityAddress) GetVerifiedAtOk() (*string, bool)`

GetVerifiedAtOk returns a tuple with the VerifiedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVerifiedAt

`func (o *ClientVerifiableIdentityAddress) SetVerifiedAt(v string)`

SetVerifiedAt sets VerifiedAt field to given value.

### HasVerifiedAt

`func (o *ClientVerifiableIdentityAddress) HasVerifiedAt() bool`

HasVerifiedAt returns a boolean if a field has been set.

### GetVia

`func (o *ClientVerifiableIdentityAddress) GetVia() string`

GetVia returns the Via field if non-nil, zero value otherwise.

### GetViaOk

`func (o *ClientVerifiableIdentityAddress) GetViaOk() (*string, bool)`

GetViaOk returns a tuple with the Via field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVia

`func (o *ClientVerifiableIdentityAddress) SetVia(v string)`

SetVia sets Via field to given value.

### HasVia

`func (o *ClientVerifiableIdentityAddress) HasVia() bool`

HasVia returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


