# StripeConfigResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Config** | [**StripeConfigurationWithIDs**](StripeConfigurationWithIDs.md) |  | 
**CreatedAt** | **string** |  | 
**Id** | **string** |  | 
**UpdatedAt** | **string** |  | 
**Version** | **string** |  | 

## Methods

### NewStripeConfigResponse

`func NewStripeConfigResponse(config StripeConfigurationWithIDs, createdAt string, id string, updatedAt string, version string, ) *StripeConfigResponse`

NewStripeConfigResponse instantiates a new StripeConfigResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewStripeConfigResponseWithDefaults

`func NewStripeConfigResponseWithDefaults() *StripeConfigResponse`

NewStripeConfigResponseWithDefaults instantiates a new StripeConfigResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetConfig

`func (o *StripeConfigResponse) GetConfig() StripeConfigurationWithIDs`

GetConfig returns the Config field if non-nil, zero value otherwise.

### GetConfigOk

`func (o *StripeConfigResponse) GetConfigOk() (*StripeConfigurationWithIDs, bool)`

GetConfigOk returns a tuple with the Config field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfig

`func (o *StripeConfigResponse) SetConfig(v StripeConfigurationWithIDs)`

SetConfig sets Config field to given value.


### GetCreatedAt

`func (o *StripeConfigResponse) GetCreatedAt() string`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *StripeConfigResponse) GetCreatedAtOk() (*string, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *StripeConfigResponse) SetCreatedAt(v string)`

SetCreatedAt sets CreatedAt field to given value.


### GetId

`func (o *StripeConfigResponse) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *StripeConfigResponse) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *StripeConfigResponse) SetId(v string)`

SetId sets Id field to given value.


### GetUpdatedAt

`func (o *StripeConfigResponse) GetUpdatedAt() string`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *StripeConfigResponse) GetUpdatedAtOk() (*string, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *StripeConfigResponse) SetUpdatedAt(v string)`

SetUpdatedAt sets UpdatedAt field to given value.


### GetVersion

`func (o *StripeConfigResponse) GetVersion() string`

GetVersion returns the Version field if non-nil, zero value otherwise.

### GetVersionOk

`func (o *StripeConfigResponse) GetVersionOk() (*string, bool)`

GetVersionOk returns a tuple with the Version field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVersion

`func (o *StripeConfigResponse) SetVersion(v string)`

SetVersion sets Version field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


