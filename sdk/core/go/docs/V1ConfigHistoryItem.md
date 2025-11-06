# V1ConfigHistoryItem

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Config** | Pointer to [**ModelsStripeConfigurationWithIDs**](ModelsStripeConfigurationWithIDs.md) | Configuration data | [optional] 
**CreatedAt** | **string** | Creation timestamp | 
**Id** | **string** | Configuration ID | 
**ParseError** | Pointer to **string** | Parse error if configuration is invalid | [optional] 
**UpdatedAt** | **string** | Update timestamp | 
**Version** | **string** | Configuration version | 

## Methods

### NewV1ConfigHistoryItem

`func NewV1ConfigHistoryItem(createdAt string, id string, updatedAt string, version string, ) *V1ConfigHistoryItem`

NewV1ConfigHistoryItem instantiates a new V1ConfigHistoryItem object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewV1ConfigHistoryItemWithDefaults

`func NewV1ConfigHistoryItemWithDefaults() *V1ConfigHistoryItem`

NewV1ConfigHistoryItemWithDefaults instantiates a new V1ConfigHistoryItem object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetConfig

`func (o *V1ConfigHistoryItem) GetConfig() ModelsStripeConfigurationWithIDs`

GetConfig returns the Config field if non-nil, zero value otherwise.

### GetConfigOk

`func (o *V1ConfigHistoryItem) GetConfigOk() (*ModelsStripeConfigurationWithIDs, bool)`

GetConfigOk returns a tuple with the Config field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfig

`func (o *V1ConfigHistoryItem) SetConfig(v ModelsStripeConfigurationWithIDs)`

SetConfig sets Config field to given value.

### HasConfig

`func (o *V1ConfigHistoryItem) HasConfig() bool`

HasConfig returns a boolean if a field has been set.

### GetCreatedAt

`func (o *V1ConfigHistoryItem) GetCreatedAt() string`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *V1ConfigHistoryItem) GetCreatedAtOk() (*string, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *V1ConfigHistoryItem) SetCreatedAt(v string)`

SetCreatedAt sets CreatedAt field to given value.


### GetId

`func (o *V1ConfigHistoryItem) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *V1ConfigHistoryItem) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *V1ConfigHistoryItem) SetId(v string)`

SetId sets Id field to given value.


### GetParseError

`func (o *V1ConfigHistoryItem) GetParseError() string`

GetParseError returns the ParseError field if non-nil, zero value otherwise.

### GetParseErrorOk

`func (o *V1ConfigHistoryItem) GetParseErrorOk() (*string, bool)`

GetParseErrorOk returns a tuple with the ParseError field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetParseError

`func (o *V1ConfigHistoryItem) SetParseError(v string)`

SetParseError sets ParseError field to given value.

### HasParseError

`func (o *V1ConfigHistoryItem) HasParseError() bool`

HasParseError returns a boolean if a field has been set.

### GetUpdatedAt

`func (o *V1ConfigHistoryItem) GetUpdatedAt() string`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *V1ConfigHistoryItem) GetUpdatedAtOk() (*string, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *V1ConfigHistoryItem) SetUpdatedAt(v string)`

SetUpdatedAt sets UpdatedAt field to given value.


### GetVersion

`func (o *V1ConfigHistoryItem) GetVersion() string`

GetVersion returns the Version field if non-nil, zero value otherwise.

### GetVersionOk

`func (o *V1ConfigHistoryItem) GetVersionOk() (*string, bool)`

GetVersionOk returns a tuple with the Version field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVersion

`func (o *V1ConfigHistoryItem) SetVersion(v string)`

SetVersion sets Version field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


