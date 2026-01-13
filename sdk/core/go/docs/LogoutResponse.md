# LogoutResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**LogoutUrl** | **string** | Kratos logout URL for browser redirect | 
**LogoutToken** | **string** | Logout token for the flow | 

## Methods

### NewLogoutResponse

`func NewLogoutResponse(logoutUrl string, logoutToken string, ) *LogoutResponse`

NewLogoutResponse instantiates a new LogoutResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewLogoutResponseWithDefaults

`func NewLogoutResponseWithDefaults() *LogoutResponse`

NewLogoutResponseWithDefaults instantiates a new LogoutResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetLogoutUrl

`func (o *LogoutResponse) GetLogoutUrl() string`

GetLogoutUrl returns the LogoutUrl field if non-nil, zero value otherwise.

### GetLogoutUrlOk

`func (o *LogoutResponse) GetLogoutUrlOk() (*string, bool)`

GetLogoutUrlOk returns a tuple with the LogoutUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLogoutUrl

`func (o *LogoutResponse) SetLogoutUrl(v string)`

SetLogoutUrl sets LogoutUrl field to given value.


### GetLogoutToken

`func (o *LogoutResponse) GetLogoutToken() string`

GetLogoutToken returns the LogoutToken field if non-nil, zero value otherwise.

### GetLogoutTokenOk

`func (o *LogoutResponse) GetLogoutTokenOk() (*string, bool)`

GetLogoutTokenOk returns a tuple with the LogoutToken field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLogoutToken

`func (o *LogoutResponse) SetLogoutToken(v string)`

SetLogoutToken sets LogoutToken field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


