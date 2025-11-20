# WhoAmI200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Data** | Pointer to [**WhoAmIResponse**](WhoAmIResponse.md) |  | [optional] 

## Methods

### NewWhoAmI200Response

`func NewWhoAmI200Response(status int32, ) *WhoAmI200Response`

NewWhoAmI200Response instantiates a new WhoAmI200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewWhoAmI200ResponseWithDefaults

`func NewWhoAmI200ResponseWithDefaults() *WhoAmI200Response`

NewWhoAmI200ResponseWithDefaults instantiates a new WhoAmI200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *WhoAmI200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *WhoAmI200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *WhoAmI200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetData

`func (o *WhoAmI200Response) GetData() WhoAmIResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *WhoAmI200Response) GetDataOk() (*WhoAmIResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *WhoAmI200Response) SetData(v WhoAmIResponse)`

SetData sets Data field to given value.

### HasData

`func (o *WhoAmI200Response) HasData() bool`

HasData returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


