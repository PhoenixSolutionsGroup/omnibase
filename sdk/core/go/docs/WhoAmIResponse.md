# WhoAmIResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Authenticated** | **bool** | Whether the user is authenticated | 
**UserId** | **string** | User ID (Kratos identity ID) | 

## Methods

### NewWhoAmIResponse

`func NewWhoAmIResponse(authenticated bool, userId string, ) *WhoAmIResponse`

NewWhoAmIResponse instantiates a new WhoAmIResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewWhoAmIResponseWithDefaults

`func NewWhoAmIResponseWithDefaults() *WhoAmIResponse`

NewWhoAmIResponseWithDefaults instantiates a new WhoAmIResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAuthenticated

`func (o *WhoAmIResponse) GetAuthenticated() bool`

GetAuthenticated returns the Authenticated field if non-nil, zero value otherwise.

### GetAuthenticatedOk

`func (o *WhoAmIResponse) GetAuthenticatedOk() (*bool, bool)`

GetAuthenticatedOk returns a tuple with the Authenticated field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAuthenticated

`func (o *WhoAmIResponse) SetAuthenticated(v bool)`

SetAuthenticated sets Authenticated field to given value.


### GetUserId

`func (o *WhoAmIResponse) GetUserId() string`

GetUserId returns the UserId field if non-nil, zero value otherwise.

### GetUserIdOk

`func (o *WhoAmIResponse) GetUserIdOk() (*string, bool)`

GetUserIdOk returns a tuple with the UserId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUserId

`func (o *WhoAmIResponse) SetUserId(v string)`

SetUserId sets UserId field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


