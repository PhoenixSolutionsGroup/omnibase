# ApiV1AuthSessionGet200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Data** | Pointer to [**ModelsSessionResponse**](ModelsSessionResponse.md) |  | [optional] 
**Status** | Pointer to **int32** |  | [optional] 

## Methods

### NewApiV1AuthSessionGet200Response

`func NewApiV1AuthSessionGet200Response() *ApiV1AuthSessionGet200Response`

NewApiV1AuthSessionGet200Response instantiates a new ApiV1AuthSessionGet200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewApiV1AuthSessionGet200ResponseWithDefaults

`func NewApiV1AuthSessionGet200ResponseWithDefaults() *ApiV1AuthSessionGet200Response`

NewApiV1AuthSessionGet200ResponseWithDefaults instantiates a new ApiV1AuthSessionGet200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetData

`func (o *ApiV1AuthSessionGet200Response) GetData() ModelsSessionResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *ApiV1AuthSessionGet200Response) GetDataOk() (*ModelsSessionResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *ApiV1AuthSessionGet200Response) SetData(v ModelsSessionResponse)`

SetData sets Data field to given value.

### HasData

`func (o *ApiV1AuthSessionGet200Response) HasData() bool`

HasData returns a boolean if a field has been set.

### GetStatus

`func (o *ApiV1AuthSessionGet200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *ApiV1AuthSessionGet200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *ApiV1AuthSessionGet200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.

### HasStatus

`func (o *ApiV1AuthSessionGet200Response) HasStatus() bool`

HasStatus returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


