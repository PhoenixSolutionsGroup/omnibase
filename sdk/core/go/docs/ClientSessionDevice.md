# ClientSessionDevice

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**AdditionalPropertiesField** | Pointer to **map[string]interface{}** |  | [optional] 
**Id** | Pointer to **string** | Device record ID | [optional] 
**IpAddress** | Pointer to **string** | IPAddress of the client | [optional] 
**Location** | Pointer to **string** | Geo Location corresponding to the IP Address | [optional] 
**UserAgent** | Pointer to **string** | UserAgent of the client | [optional] 

## Methods

### NewClientSessionDevice

`func NewClientSessionDevice() *ClientSessionDevice`

NewClientSessionDevice instantiates a new ClientSessionDevice object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewClientSessionDeviceWithDefaults

`func NewClientSessionDeviceWithDefaults() *ClientSessionDevice`

NewClientSessionDeviceWithDefaults instantiates a new ClientSessionDevice object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAdditionalPropertiesField

`func (o *ClientSessionDevice) GetAdditionalPropertiesField() map[string]interface{}`

GetAdditionalPropertiesField returns the AdditionalPropertiesField field if non-nil, zero value otherwise.

### GetAdditionalPropertiesFieldOk

`func (o *ClientSessionDevice) GetAdditionalPropertiesFieldOk() (*map[string]interface{}, bool)`

GetAdditionalPropertiesFieldOk returns a tuple with the AdditionalPropertiesField field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAdditionalPropertiesField

`func (o *ClientSessionDevice) SetAdditionalPropertiesField(v map[string]interface{})`

SetAdditionalPropertiesField sets AdditionalPropertiesField field to given value.

### HasAdditionalPropertiesField

`func (o *ClientSessionDevice) HasAdditionalPropertiesField() bool`

HasAdditionalPropertiesField returns a boolean if a field has been set.

### GetId

`func (o *ClientSessionDevice) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ClientSessionDevice) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ClientSessionDevice) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *ClientSessionDevice) HasId() bool`

HasId returns a boolean if a field has been set.

### GetIpAddress

`func (o *ClientSessionDevice) GetIpAddress() string`

GetIpAddress returns the IpAddress field if non-nil, zero value otherwise.

### GetIpAddressOk

`func (o *ClientSessionDevice) GetIpAddressOk() (*string, bool)`

GetIpAddressOk returns a tuple with the IpAddress field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIpAddress

`func (o *ClientSessionDevice) SetIpAddress(v string)`

SetIpAddress sets IpAddress field to given value.

### HasIpAddress

`func (o *ClientSessionDevice) HasIpAddress() bool`

HasIpAddress returns a boolean if a field has been set.

### GetLocation

`func (o *ClientSessionDevice) GetLocation() string`

GetLocation returns the Location field if non-nil, zero value otherwise.

### GetLocationOk

`func (o *ClientSessionDevice) GetLocationOk() (*string, bool)`

GetLocationOk returns a tuple with the Location field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLocation

`func (o *ClientSessionDevice) SetLocation(v string)`

SetLocation sets Location field to given value.

### HasLocation

`func (o *ClientSessionDevice) HasLocation() bool`

HasLocation returns a boolean if a field has been set.

### GetUserAgent

`func (o *ClientSessionDevice) GetUserAgent() string`

GetUserAgent returns the UserAgent field if non-nil, zero value otherwise.

### GetUserAgentOk

`func (o *ClientSessionDevice) GetUserAgentOk() (*string, bool)`

GetUserAgentOk returns a tuple with the UserAgent field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUserAgent

`func (o *ClientSessionDevice) SetUserAgent(v string)`

SetUserAgent sets UserAgent field to given value.

### HasUserAgent

`func (o *ClientSessionDevice) HasUserAgent() bool`

HasUserAgent returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


