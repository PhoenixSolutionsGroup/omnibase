# Logout200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Data** | Pointer to [**ModelsLogoutResponse**](ModelsLogoutResponse.md) |  | [optional] 
**Status** | Pointer to **int32** |  | [optional] 

## Methods

### NewLogout200Response

`func NewLogout200Response() *Logout200Response`

NewLogout200Response instantiates a new Logout200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewLogout200ResponseWithDefaults

`func NewLogout200ResponseWithDefaults() *Logout200Response`

NewLogout200ResponseWithDefaults instantiates a new Logout200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetData

`func (o *Logout200Response) GetData() ModelsLogoutResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *Logout200Response) GetDataOk() (*ModelsLogoutResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *Logout200Response) SetData(v ModelsLogoutResponse)`

SetData sets Data field to given value.

### HasData

`func (o *Logout200Response) HasData() bool`

HasData returns a boolean if a field has been set.

### GetStatus

`func (o *Logout200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *Logout200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *Logout200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.

### HasStatus

`func (o *Logout200Response) HasStatus() bool`

HasStatus returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


