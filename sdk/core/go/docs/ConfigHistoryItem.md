# ConfigHistoryItem

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Config** | [**StripeConfigurationWithIDs**](StripeConfigurationWithIDs.md) |  | 
**CreatedAt** | **string** |  | 
**Id** | **string** |  | 
**ParseError** | Pointer to **string** |  | [optional] 
**UpdatedAt** | **string** |  | 
**Version** | **string** |  | 

## Methods

### NewConfigHistoryItem

`func NewConfigHistoryItem(config StripeConfigurationWithIDs, createdAt string, id string, updatedAt string, version string, ) *ConfigHistoryItem`

NewConfigHistoryItem instantiates a new ConfigHistoryItem object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewConfigHistoryItemWithDefaults

`func NewConfigHistoryItemWithDefaults() *ConfigHistoryItem`

NewConfigHistoryItemWithDefaults instantiates a new ConfigHistoryItem object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetConfig

`func (o *ConfigHistoryItem) GetConfig() StripeConfigurationWithIDs`

GetConfig returns the Config field if non-nil, zero value otherwise.

### GetConfigOk

`func (o *ConfigHistoryItem) GetConfigOk() (*StripeConfigurationWithIDs, bool)`

GetConfigOk returns a tuple with the Config field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfig

`func (o *ConfigHistoryItem) SetConfig(v StripeConfigurationWithIDs)`

SetConfig sets Config field to given value.


### GetCreatedAt

`func (o *ConfigHistoryItem) GetCreatedAt() string`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *ConfigHistoryItem) GetCreatedAtOk() (*string, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *ConfigHistoryItem) SetCreatedAt(v string)`

SetCreatedAt sets CreatedAt field to given value.


### GetId

`func (o *ConfigHistoryItem) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ConfigHistoryItem) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ConfigHistoryItem) SetId(v string)`

SetId sets Id field to given value.


### GetParseError

`func (o *ConfigHistoryItem) GetParseError() string`

GetParseError returns the ParseError field if non-nil, zero value otherwise.

### GetParseErrorOk

`func (o *ConfigHistoryItem) GetParseErrorOk() (*string, bool)`

GetParseErrorOk returns a tuple with the ParseError field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetParseError

`func (o *ConfigHistoryItem) SetParseError(v string)`

SetParseError sets ParseError field to given value.

### HasParseError

`func (o *ConfigHistoryItem) HasParseError() bool`

HasParseError returns a boolean if a field has been set.

### GetUpdatedAt

`func (o *ConfigHistoryItem) GetUpdatedAt() string`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *ConfigHistoryItem) GetUpdatedAtOk() (*string, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *ConfigHistoryItem) SetUpdatedAt(v string)`

SetUpdatedAt sets UpdatedAt field to given value.


### GetVersion

`func (o *ConfigHistoryItem) GetVersion() string`

GetVersion returns the Version field if non-nil, zero value otherwise.

### GetVersionOk

`func (o *ConfigHistoryItem) GetVersionOk() (*string, bool)`

GetVersionOk returns a tuple with the Version field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVersion

`func (o *ConfigHistoryItem) SetVersion(v string)`

SetVersion sets Version field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


