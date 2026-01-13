# AcceptInvite200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Data** | Pointer to [**AcceptInviteResponse**](AcceptInviteResponse.md) |  | [optional] 

## Methods

### NewAcceptInvite200Response

`func NewAcceptInvite200Response(status int32, ) *AcceptInvite200Response`

NewAcceptInvite200Response instantiates a new AcceptInvite200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAcceptInvite200ResponseWithDefaults

`func NewAcceptInvite200ResponseWithDefaults() *AcceptInvite200Response`

NewAcceptInvite200ResponseWithDefaults instantiates a new AcceptInvite200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *AcceptInvite200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *AcceptInvite200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *AcceptInvite200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetData

`func (o *AcceptInvite200Response) GetData() AcceptInviteResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *AcceptInvite200Response) GetDataOk() (*AcceptInviteResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *AcceptInvite200Response) SetData(v AcceptInviteResponse)`

SetData sets Data field to given value.

### HasData

`func (o *AcceptInvite200Response) HasData() bool`

HasData returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


