# V1StripeConfigResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Config** | [**ModelsStripeConfigurationWithIDs**](ModelsStripeConfigurationWithIDs.md) | Configuration data with Stripe IDs | 
**CreatedAt** | **string** | Creation timestamp | 
**Id** | **string** | Configuration ID | 
**UpdatedAt** | **string** | Last update timestamp | 
**Version** | **string** | Configuration version | 

## Methods

### NewV1StripeConfigResponse

`func NewV1StripeConfigResponse(config ModelsStripeConfigurationWithIDs, createdAt string, id string, updatedAt string, version string, ) *V1StripeConfigResponse`

NewV1StripeConfigResponse instantiates a new V1StripeConfigResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewV1StripeConfigResponseWithDefaults

`func NewV1StripeConfigResponseWithDefaults() *V1StripeConfigResponse`

NewV1StripeConfigResponseWithDefaults instantiates a new V1StripeConfigResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetConfig

`func (o *V1StripeConfigResponse) GetConfig() ModelsStripeConfigurationWithIDs`

GetConfig returns the Config field if non-nil, zero value otherwise.

### GetConfigOk

`func (o *V1StripeConfigResponse) GetConfigOk() (*ModelsStripeConfigurationWithIDs, bool)`

GetConfigOk returns a tuple with the Config field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfig

`func (o *V1StripeConfigResponse) SetConfig(v ModelsStripeConfigurationWithIDs)`

SetConfig sets Config field to given value.


### GetCreatedAt

`func (o *V1StripeConfigResponse) GetCreatedAt() string`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *V1StripeConfigResponse) GetCreatedAtOk() (*string, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *V1StripeConfigResponse) SetCreatedAt(v string)`

SetCreatedAt sets CreatedAt field to given value.


### GetId

`func (o *V1StripeConfigResponse) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *V1StripeConfigResponse) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *V1StripeConfigResponse) SetId(v string)`

SetId sets Id field to given value.


### GetUpdatedAt

`func (o *V1StripeConfigResponse) GetUpdatedAt() string`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *V1StripeConfigResponse) GetUpdatedAtOk() (*string, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *V1StripeConfigResponse) SetUpdatedAt(v string)`

SetUpdatedAt sets UpdatedAt field to given value.


### GetVersion

`func (o *V1StripeConfigResponse) GetVersion() string`

GetVersion returns the Version field if non-nil, zero value otherwise.

### GetVersionOk

`func (o *V1StripeConfigResponse) GetVersionOk() (*string, bool)`

GetVersionOk returns a tuple with the Version field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVersion

`func (o *V1StripeConfigResponse) SetVersion(v string)`

SetVersion sets Version field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


