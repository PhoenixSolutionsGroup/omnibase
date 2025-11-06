# ClientSessionAuthenticationMethod

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Aal** | Pointer to [**ClientAuthenticatorAssuranceLevel**](ClientAuthenticatorAssuranceLevel.md) |  | [optional] 
**AdditionalPropertiesField** | Pointer to **map[string]interface{}** |  | [optional] 
**CompletedAt** | Pointer to **string** | When the authentication challenge was completed. | [optional] 
**Method** | Pointer to **string** |  | [optional] 
**Organization** | Pointer to **string** | The Organization id used for authentication | [optional] 
**Provider** | Pointer to **string** | OIDC or SAML provider id used for authentication | [optional] 

## Methods

### NewClientSessionAuthenticationMethod

`func NewClientSessionAuthenticationMethod() *ClientSessionAuthenticationMethod`

NewClientSessionAuthenticationMethod instantiates a new ClientSessionAuthenticationMethod object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewClientSessionAuthenticationMethodWithDefaults

`func NewClientSessionAuthenticationMethodWithDefaults() *ClientSessionAuthenticationMethod`

NewClientSessionAuthenticationMethodWithDefaults instantiates a new ClientSessionAuthenticationMethod object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAal

`func (o *ClientSessionAuthenticationMethod) GetAal() ClientAuthenticatorAssuranceLevel`

GetAal returns the Aal field if non-nil, zero value otherwise.

### GetAalOk

`func (o *ClientSessionAuthenticationMethod) GetAalOk() (*ClientAuthenticatorAssuranceLevel, bool)`

GetAalOk returns a tuple with the Aal field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAal

`func (o *ClientSessionAuthenticationMethod) SetAal(v ClientAuthenticatorAssuranceLevel)`

SetAal sets Aal field to given value.

### HasAal

`func (o *ClientSessionAuthenticationMethod) HasAal() bool`

HasAal returns a boolean if a field has been set.

### GetAdditionalPropertiesField

`func (o *ClientSessionAuthenticationMethod) GetAdditionalPropertiesField() map[string]interface{}`

GetAdditionalPropertiesField returns the AdditionalPropertiesField field if non-nil, zero value otherwise.

### GetAdditionalPropertiesFieldOk

`func (o *ClientSessionAuthenticationMethod) GetAdditionalPropertiesFieldOk() (*map[string]interface{}, bool)`

GetAdditionalPropertiesFieldOk returns a tuple with the AdditionalPropertiesField field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAdditionalPropertiesField

`func (o *ClientSessionAuthenticationMethod) SetAdditionalPropertiesField(v map[string]interface{})`

SetAdditionalPropertiesField sets AdditionalPropertiesField field to given value.

### HasAdditionalPropertiesField

`func (o *ClientSessionAuthenticationMethod) HasAdditionalPropertiesField() bool`

HasAdditionalPropertiesField returns a boolean if a field has been set.

### GetCompletedAt

`func (o *ClientSessionAuthenticationMethod) GetCompletedAt() string`

GetCompletedAt returns the CompletedAt field if non-nil, zero value otherwise.

### GetCompletedAtOk

`func (o *ClientSessionAuthenticationMethod) GetCompletedAtOk() (*string, bool)`

GetCompletedAtOk returns a tuple with the CompletedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCompletedAt

`func (o *ClientSessionAuthenticationMethod) SetCompletedAt(v string)`

SetCompletedAt sets CompletedAt field to given value.

### HasCompletedAt

`func (o *ClientSessionAuthenticationMethod) HasCompletedAt() bool`

HasCompletedAt returns a boolean if a field has been set.

### GetMethod

`func (o *ClientSessionAuthenticationMethod) GetMethod() string`

GetMethod returns the Method field if non-nil, zero value otherwise.

### GetMethodOk

`func (o *ClientSessionAuthenticationMethod) GetMethodOk() (*string, bool)`

GetMethodOk returns a tuple with the Method field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMethod

`func (o *ClientSessionAuthenticationMethod) SetMethod(v string)`

SetMethod sets Method field to given value.

### HasMethod

`func (o *ClientSessionAuthenticationMethod) HasMethod() bool`

HasMethod returns a boolean if a field has been set.

### GetOrganization

`func (o *ClientSessionAuthenticationMethod) GetOrganization() string`

GetOrganization returns the Organization field if non-nil, zero value otherwise.

### GetOrganizationOk

`func (o *ClientSessionAuthenticationMethod) GetOrganizationOk() (*string, bool)`

GetOrganizationOk returns a tuple with the Organization field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetOrganization

`func (o *ClientSessionAuthenticationMethod) SetOrganization(v string)`

SetOrganization sets Organization field to given value.

### HasOrganization

`func (o *ClientSessionAuthenticationMethod) HasOrganization() bool`

HasOrganization returns a boolean if a field has been set.

### GetProvider

`func (o *ClientSessionAuthenticationMethod) GetProvider() string`

GetProvider returns the Provider field if non-nil, zero value otherwise.

### GetProviderOk

`func (o *ClientSessionAuthenticationMethod) GetProviderOk() (*string, bool)`

GetProviderOk returns a tuple with the Provider field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProvider

`func (o *ClientSessionAuthenticationMethod) SetProvider(v string)`

SetProvider sets Provider field to given value.

### HasProvider

`func (o *ClientSessionAuthenticationMethod) HasProvider() bool`

HasProvider returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


