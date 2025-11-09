# ConvertStripeIDToConfigID200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Data** | Pointer to [**V1StripeIDConversionResponse**](V1StripeIDConversionResponse.md) |  | [optional] 
**Status** | Pointer to **int32** | HTTP status code | [optional] 

## Methods

### NewConvertStripeIDToConfigID200Response

`func NewConvertStripeIDToConfigID200Response() *ConvertStripeIDToConfigID200Response`

NewConvertStripeIDToConfigID200Response instantiates a new ConvertStripeIDToConfigID200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewConvertStripeIDToConfigID200ResponseWithDefaults

`func NewConvertStripeIDToConfigID200ResponseWithDefaults() *ConvertStripeIDToConfigID200Response`

NewConvertStripeIDToConfigID200ResponseWithDefaults instantiates a new ConvertStripeIDToConfigID200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetData

`func (o *ConvertStripeIDToConfigID200Response) GetData() V1StripeIDConversionResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *ConvertStripeIDToConfigID200Response) GetDataOk() (*V1StripeIDConversionResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *ConvertStripeIDToConfigID200Response) SetData(v V1StripeIDConversionResponse)`

SetData sets Data field to given value.

### HasData

`func (o *ConvertStripeIDToConfigID200Response) HasData() bool`

HasData returns a boolean if a field has been set.

### GetStatus

`func (o *ConvertStripeIDToConfigID200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *ConvertStripeIDToConfigID200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *ConvertStripeIDToConfigID200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.

### HasStatus

`func (o *ConvertStripeIDToConfigID200Response) HasStatus() bool`

HasStatus returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


