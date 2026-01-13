# GetStripeConfigHistory200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Data** | Pointer to [**ConfigHistoryResponse**](ConfigHistoryResponse.md) |  | [optional] 

## Methods

### NewGetStripeConfigHistory200Response

`func NewGetStripeConfigHistory200Response(status int32, ) *GetStripeConfigHistory200Response`

NewGetStripeConfigHistory200Response instantiates a new GetStripeConfigHistory200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetStripeConfigHistory200ResponseWithDefaults

`func NewGetStripeConfigHistory200ResponseWithDefaults() *GetStripeConfigHistory200Response`

NewGetStripeConfigHistory200ResponseWithDefaults instantiates a new GetStripeConfigHistory200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *GetStripeConfigHistory200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *GetStripeConfigHistory200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *GetStripeConfigHistory200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetData

`func (o *GetStripeConfigHistory200Response) GetData() ConfigHistoryResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *GetStripeConfigHistory200Response) GetDataOk() (*ConfigHistoryResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *GetStripeConfigHistory200Response) SetData(v ConfigHistoryResponse)`

SetData sets Data field to given value.

### HasData

`func (o *GetStripeConfigHistory200Response) HasData() bool`

HasData returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


