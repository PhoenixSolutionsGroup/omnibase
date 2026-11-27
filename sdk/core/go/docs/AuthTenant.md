# AuthTenant

## Properties

| Name                 | Type               | Description | Notes |
| -------------------- | ------------------ | ----------- | ----- |
| **CreatedAt**        | **time.Time**      |             |
| **Id**               | **string**         |             |
| **Name**             | **string**         |             |
| **StripeCustomerId** | **NullableString** |             |
| **Type**             | **string**         |             |
| **UpdatedAt**        | **time.Time**      |             |

## Methods

### NewAuthTenant

`func NewAuthTenant(createdAt time.Time, id string, name string, stripeCustomerId NullableString, type_ string, updatedAt time.Time, ) *AuthTenant`

NewAuthTenant instantiates a new AuthTenant object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAuthTenantWithDefaults

`func NewAuthTenantWithDefaults() *AuthTenant`

NewAuthTenantWithDefaults instantiates a new AuthTenant object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCreatedAt

`func (o *AuthTenant) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *AuthTenant) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *AuthTenant) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.

### GetId

`func (o *AuthTenant) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *AuthTenant) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *AuthTenant) SetId(v string)`

SetId sets Id field to given value.

### GetName

`func (o *AuthTenant) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *AuthTenant) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *AuthTenant) SetName(v string)`

SetName sets Name field to given value.

### GetStripeCustomerId

`func (o *AuthTenant) GetStripeCustomerId() string`

GetStripeCustomerId returns the StripeCustomerId field if non-nil, zero value otherwise.

### GetStripeCustomerIdOk

`func (o *AuthTenant) GetStripeCustomerIdOk() (*string, bool)`

GetStripeCustomerIdOk returns a tuple with the StripeCustomerId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeCustomerId

`func (o *AuthTenant) SetStripeCustomerId(v string)`

SetStripeCustomerId sets StripeCustomerId field to given value.

### SetStripeCustomerIdNil

`func (o *AuthTenant) SetStripeCustomerIdNil(b bool)`

SetStripeCustomerIdNil sets the value for StripeCustomerId to be an explicit nil

### UnsetStripeCustomerId

`func (o *AuthTenant) UnsetStripeCustomerId()`

UnsetStripeCustomerId ensures that no value is present for StripeCustomerId, not even an explicit nil

### GetType

`func (o *AuthTenant) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *AuthTenant) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *AuthTenant) SetType(v string)`

SetType sets Type field to given value.

### GetUpdatedAt

`func (o *AuthTenant) GetUpdatedAt() time.Time`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *AuthTenant) GetUpdatedAtOk() (*time.Time, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *AuthTenant) SetUpdatedAt(v time.Time)`

SetUpdatedAt sets UpdatedAt field to given value.

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
