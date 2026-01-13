# ListWebhooks200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Data** | Pointer to [**ListWebhooksResponse**](ListWebhooksResponse.md) |  | [optional] 

## Methods

### NewListWebhooks200Response

`func NewListWebhooks200Response(status int32, ) *ListWebhooks200Response`

NewListWebhooks200Response instantiates a new ListWebhooks200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewListWebhooks200ResponseWithDefaults

`func NewListWebhooks200ResponseWithDefaults() *ListWebhooks200Response`

NewListWebhooks200ResponseWithDefaults instantiates a new ListWebhooks200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *ListWebhooks200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *ListWebhooks200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *ListWebhooks200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetData

`func (o *ListWebhooks200Response) GetData() ListWebhooksResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *ListWebhooks200Response) GetDataOk() (*ListWebhooksResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *ListWebhooks200Response) SetData(v ListWebhooksResponse)`

SetData sets Data field to given value.

### HasData

`func (o *ListWebhooks200Response) HasData() bool`

HasData returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


