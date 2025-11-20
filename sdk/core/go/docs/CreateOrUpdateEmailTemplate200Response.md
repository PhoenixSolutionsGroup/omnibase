# CreateOrUpdateEmailTemplate200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Data** | Pointer to [**CreateOrUpdateEmailTemplate200ResponseAllOfData**](CreateOrUpdateEmailTemplate200ResponseAllOfData.md) |  | [optional] 

## Methods

### NewCreateOrUpdateEmailTemplate200Response

`func NewCreateOrUpdateEmailTemplate200Response(status int32, ) *CreateOrUpdateEmailTemplate200Response`

NewCreateOrUpdateEmailTemplate200Response instantiates a new CreateOrUpdateEmailTemplate200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateOrUpdateEmailTemplate200ResponseWithDefaults

`func NewCreateOrUpdateEmailTemplate200ResponseWithDefaults() *CreateOrUpdateEmailTemplate200Response`

NewCreateOrUpdateEmailTemplate200ResponseWithDefaults instantiates a new CreateOrUpdateEmailTemplate200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *CreateOrUpdateEmailTemplate200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *CreateOrUpdateEmailTemplate200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *CreateOrUpdateEmailTemplate200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetData

`func (o *CreateOrUpdateEmailTemplate200Response) GetData() CreateOrUpdateEmailTemplate200ResponseAllOfData`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *CreateOrUpdateEmailTemplate200Response) GetDataOk() (*CreateOrUpdateEmailTemplate200ResponseAllOfData, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *CreateOrUpdateEmailTemplate200Response) SetData(v CreateOrUpdateEmailTemplate200ResponseAllOfData)`

SetData sets Data field to given value.

### HasData

`func (o *CreateOrUpdateEmailTemplate200Response) HasData() bool`

HasData returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


