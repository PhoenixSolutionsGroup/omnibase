# GetIdentity200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Data** | Pointer to **map[string]interface{}** |  | [optional] 

## Methods

### NewGetIdentity200Response

`func NewGetIdentity200Response(status int32, ) *GetIdentity200Response`

NewGetIdentity200Response instantiates a new GetIdentity200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetIdentity200ResponseWithDefaults

`func NewGetIdentity200ResponseWithDefaults() *GetIdentity200Response`

NewGetIdentity200ResponseWithDefaults instantiates a new GetIdentity200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *GetIdentity200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *GetIdentity200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *GetIdentity200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetData

`func (o *GetIdentity200Response) GetData() map[string]interface{}`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *GetIdentity200Response) GetDataOk() (*map[string]interface{}, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *GetIdentity200Response) SetData(v map[string]interface{})`

SetData sets Data field to given value.

### HasData

`func (o *GetIdentity200Response) HasData() bool`

HasData returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


