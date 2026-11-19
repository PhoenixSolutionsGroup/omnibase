# GetMeterResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Meter** | [**MeterWithStripeID**](MeterWithStripeID.md) |  | 

## Methods

### NewGetMeterResponse

`func NewGetMeterResponse(meter MeterWithStripeID, ) *GetMeterResponse`

NewGetMeterResponse instantiates a new GetMeterResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetMeterResponseWithDefaults

`func NewGetMeterResponseWithDefaults() *GetMeterResponse`

NewGetMeterResponseWithDefaults instantiates a new GetMeterResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMeter

`func (o *GetMeterResponse) GetMeter() MeterWithStripeID`

GetMeter returns the Meter field if non-nil, zero value otherwise.

### GetMeterOk

`func (o *GetMeterResponse) GetMeterOk() (*MeterWithStripeID, bool)`

GetMeterOk returns a tuple with the Meter field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMeter

`func (o *GetMeterResponse) SetMeter(v MeterWithStripeID)`

SetMeter sets Meter field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


