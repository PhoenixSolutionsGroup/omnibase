# GetTenantByStripeCustomerIDRow

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**CreatedAt** | **time.Time** |  | 
**EnterpriseId** | **NullableString** |  | 
**EnterpriseTemplate** | **NullableString** |  | 
**Id** | **string** |  | 
**Name** | **string** |  | 
**StripeCustomerId** | **NullableString** |  | 
**Type** | **string** |  | 
**UpdatedAt** | **time.Time** |  | 

## Methods

### NewGetTenantByStripeCustomerIDRow

`func NewGetTenantByStripeCustomerIDRow(createdAt time.Time, enterpriseId NullableString, enterpriseTemplate NullableString, id string, name string, stripeCustomerId NullableString, type_ string, updatedAt time.Time, ) *GetTenantByStripeCustomerIDRow`

NewGetTenantByStripeCustomerIDRow instantiates a new GetTenantByStripeCustomerIDRow object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetTenantByStripeCustomerIDRowWithDefaults

`func NewGetTenantByStripeCustomerIDRowWithDefaults() *GetTenantByStripeCustomerIDRow`

NewGetTenantByStripeCustomerIDRowWithDefaults instantiates a new GetTenantByStripeCustomerIDRow object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCreatedAt

`func (o *GetTenantByStripeCustomerIDRow) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *GetTenantByStripeCustomerIDRow) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *GetTenantByStripeCustomerIDRow) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.


### GetEnterpriseId

`func (o *GetTenantByStripeCustomerIDRow) GetEnterpriseId() string`

GetEnterpriseId returns the EnterpriseId field if non-nil, zero value otherwise.

### GetEnterpriseIdOk

`func (o *GetTenantByStripeCustomerIDRow) GetEnterpriseIdOk() (*string, bool)`

GetEnterpriseIdOk returns a tuple with the EnterpriseId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnterpriseId

`func (o *GetTenantByStripeCustomerIDRow) SetEnterpriseId(v string)`

SetEnterpriseId sets EnterpriseId field to given value.


### SetEnterpriseIdNil

`func (o *GetTenantByStripeCustomerIDRow) SetEnterpriseIdNil(b bool)`

 SetEnterpriseIdNil sets the value for EnterpriseId to be an explicit nil

### UnsetEnterpriseId
`func (o *GetTenantByStripeCustomerIDRow) UnsetEnterpriseId()`

UnsetEnterpriseId ensures that no value is present for EnterpriseId, not even an explicit nil
### GetEnterpriseTemplate

`func (o *GetTenantByStripeCustomerIDRow) GetEnterpriseTemplate() string`

GetEnterpriseTemplate returns the EnterpriseTemplate field if non-nil, zero value otherwise.

### GetEnterpriseTemplateOk

`func (o *GetTenantByStripeCustomerIDRow) GetEnterpriseTemplateOk() (*string, bool)`

GetEnterpriseTemplateOk returns a tuple with the EnterpriseTemplate field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnterpriseTemplate

`func (o *GetTenantByStripeCustomerIDRow) SetEnterpriseTemplate(v string)`

SetEnterpriseTemplate sets EnterpriseTemplate field to given value.


### SetEnterpriseTemplateNil

`func (o *GetTenantByStripeCustomerIDRow) SetEnterpriseTemplateNil(b bool)`

 SetEnterpriseTemplateNil sets the value for EnterpriseTemplate to be an explicit nil

### UnsetEnterpriseTemplate
`func (o *GetTenantByStripeCustomerIDRow) UnsetEnterpriseTemplate()`

UnsetEnterpriseTemplate ensures that no value is present for EnterpriseTemplate, not even an explicit nil
### GetId

`func (o *GetTenantByStripeCustomerIDRow) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *GetTenantByStripeCustomerIDRow) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *GetTenantByStripeCustomerIDRow) SetId(v string)`

SetId sets Id field to given value.


### GetName

`func (o *GetTenantByStripeCustomerIDRow) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *GetTenantByStripeCustomerIDRow) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *GetTenantByStripeCustomerIDRow) SetName(v string)`

SetName sets Name field to given value.


### GetStripeCustomerId

`func (o *GetTenantByStripeCustomerIDRow) GetStripeCustomerId() string`

GetStripeCustomerId returns the StripeCustomerId field if non-nil, zero value otherwise.

### GetStripeCustomerIdOk

`func (o *GetTenantByStripeCustomerIDRow) GetStripeCustomerIdOk() (*string, bool)`

GetStripeCustomerIdOk returns a tuple with the StripeCustomerId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeCustomerId

`func (o *GetTenantByStripeCustomerIDRow) SetStripeCustomerId(v string)`

SetStripeCustomerId sets StripeCustomerId field to given value.


### SetStripeCustomerIdNil

`func (o *GetTenantByStripeCustomerIDRow) SetStripeCustomerIdNil(b bool)`

 SetStripeCustomerIdNil sets the value for StripeCustomerId to be an explicit nil

### UnsetStripeCustomerId
`func (o *GetTenantByStripeCustomerIDRow) UnsetStripeCustomerId()`

UnsetStripeCustomerId ensures that no value is present for StripeCustomerId, not even an explicit nil
### GetType

`func (o *GetTenantByStripeCustomerIDRow) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *GetTenantByStripeCustomerIDRow) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *GetTenantByStripeCustomerIDRow) SetType(v string)`

SetType sets Type field to given value.


### GetUpdatedAt

`func (o *GetTenantByStripeCustomerIDRow) GetUpdatedAt() time.Time`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *GetTenantByStripeCustomerIDRow) GetUpdatedAtOk() (*time.Time, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *GetTenantByStripeCustomerIDRow) SetUpdatedAt(v time.Time)`

SetUpdatedAt sets UpdatedAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


