# KratosIdentityCredentials

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Password** | Pointer to [**KratosIdentityCredentialsPassword**](KratosIdentityCredentialsPassword.md) |  | [optional] 

## Methods

### NewKratosIdentityCredentials

`func NewKratosIdentityCredentials() *KratosIdentityCredentials`

NewKratosIdentityCredentials instantiates a new KratosIdentityCredentials object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewKratosIdentityCredentialsWithDefaults

`func NewKratosIdentityCredentialsWithDefaults() *KratosIdentityCredentials`

NewKratosIdentityCredentialsWithDefaults instantiates a new KratosIdentityCredentials object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPassword

`func (o *KratosIdentityCredentials) GetPassword() KratosIdentityCredentialsPassword`

GetPassword returns the Password field if non-nil, zero value otherwise.

### GetPasswordOk

`func (o *KratosIdentityCredentials) GetPasswordOk() (*KratosIdentityCredentialsPassword, bool)`

GetPasswordOk returns a tuple with the Password field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPassword

`func (o *KratosIdentityCredentials) SetPassword(v KratosIdentityCredentialsPassword)`

SetPassword sets Password field to given value.

### HasPassword

`func (o *KratosIdentityCredentials) HasPassword() bool`

HasPassword returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


