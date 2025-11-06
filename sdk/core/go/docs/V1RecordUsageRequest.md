# V1RecordUsageRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**MeterEventName** | **string** | The meter event name as defined in your Stripe configuration | 
**Value** | **string** | The usage value to record | 

## Methods

### NewV1RecordUsageRequest

`func NewV1RecordUsageRequest(meterEventName string, value string, ) *V1RecordUsageRequest`

NewV1RecordUsageRequest instantiates a new V1RecordUsageRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewV1RecordUsageRequestWithDefaults

`func NewV1RecordUsageRequestWithDefaults() *V1RecordUsageRequest`

NewV1RecordUsageRequestWithDefaults instantiates a new V1RecordUsageRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMeterEventName

`func (o *V1RecordUsageRequest) GetMeterEventName() string`

GetMeterEventName returns the MeterEventName field if non-nil, zero value otherwise.

### GetMeterEventNameOk

`func (o *V1RecordUsageRequest) GetMeterEventNameOk() (*string, bool)`

GetMeterEventNameOk returns a tuple with the MeterEventName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMeterEventName

`func (o *V1RecordUsageRequest) SetMeterEventName(v string)`

SetMeterEventName sets MeterEventName field to given value.


### GetValue

`func (o *V1RecordUsageRequest) GetValue() string`

GetValue returns the Value field if non-nil, zero value otherwise.

### GetValueOk

`func (o *V1RecordUsageRequest) GetValueOk() (*string, bool)`

GetValueOk returns a tuple with the Value field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetValue

`func (o *V1RecordUsageRequest) SetValue(v string)`

SetValue sets Value field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


