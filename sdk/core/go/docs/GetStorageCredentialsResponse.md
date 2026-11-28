# GetStorageCredentialsResponse

## Properties

| Name             | Type                     | Description                                        | Notes      |
| ---------------- | ------------------------ | -------------------------------------------------- | ---------- |
| **AccessKey**    | **string**               | S3 access key ID.                                  |
| **BucketName**   | **string**               |                                                    |
| **Endpoint**     | **string**               |                                                    |
| **Expiration**   | Pointer to **time.Time** | Credential expiration time.                        | [optional] |
| **Region**       | **string**               |                                                    |
| **SecretKey**    | **string**               | S3 secret access key.                              |
| **SessionToken** | Pointer to **string**    | Session token required with temporary credentials. | [optional] |

## Methods

### NewGetStorageCredentialsResponse

`func NewGetStorageCredentialsResponse(accessKey string, bucketName string, endpoint string, region string, secretKey string, ) *GetStorageCredentialsResponse`

NewGetStorageCredentialsResponse instantiates a new GetStorageCredentialsResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetStorageCredentialsResponseWithDefaults

`func NewGetStorageCredentialsResponseWithDefaults() *GetStorageCredentialsResponse`

NewGetStorageCredentialsResponseWithDefaults instantiates a new GetStorageCredentialsResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAccessKey

`func (o *GetStorageCredentialsResponse) GetAccessKey() string`

GetAccessKey returns the AccessKey field if non-nil, zero value otherwise.

### GetAccessKeyOk

`func (o *GetStorageCredentialsResponse) GetAccessKeyOk() (*string, bool)`

GetAccessKeyOk returns a tuple with the AccessKey field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAccessKey

`func (o *GetStorageCredentialsResponse) SetAccessKey(v string)`

SetAccessKey sets AccessKey field to given value.

### GetBucketName

`func (o *GetStorageCredentialsResponse) GetBucketName() string`

GetBucketName returns the BucketName field if non-nil, zero value otherwise.

### GetBucketNameOk

`func (o *GetStorageCredentialsResponse) GetBucketNameOk() (*string, bool)`

GetBucketNameOk returns a tuple with the BucketName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBucketName

`func (o *GetStorageCredentialsResponse) SetBucketName(v string)`

SetBucketName sets BucketName field to given value.

### GetEndpoint

`func (o *GetStorageCredentialsResponse) GetEndpoint() string`

GetEndpoint returns the Endpoint field if non-nil, zero value otherwise.

### GetEndpointOk

`func (o *GetStorageCredentialsResponse) GetEndpointOk() (*string, bool)`

GetEndpointOk returns a tuple with the Endpoint field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpoint

`func (o *GetStorageCredentialsResponse) SetEndpoint(v string)`

SetEndpoint sets Endpoint field to given value.

### GetExpiration

`func (o *GetStorageCredentialsResponse) GetExpiration() time.Time`

GetExpiration returns the Expiration field if non-nil, zero value otherwise.

### GetExpirationOk

`func (o *GetStorageCredentialsResponse) GetExpirationOk() (*time.Time, bool)`

GetExpirationOk returns a tuple with the Expiration field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetExpiration

`func (o *GetStorageCredentialsResponse) SetExpiration(v time.Time)`

SetExpiration sets Expiration field to given value.

### HasExpiration

`func (o *GetStorageCredentialsResponse) HasExpiration() bool`

HasExpiration returns a boolean if a field has been set.

### GetRegion

`func (o *GetStorageCredentialsResponse) GetRegion() string`

GetRegion returns the Region field if non-nil, zero value otherwise.

### GetRegionOk

`func (o *GetStorageCredentialsResponse) GetRegionOk() (*string, bool)`

GetRegionOk returns a tuple with the Region field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRegion

`func (o *GetStorageCredentialsResponse) SetRegion(v string)`

SetRegion sets Region field to given value.

### GetSecretKey

`func (o *GetStorageCredentialsResponse) GetSecretKey() string`

GetSecretKey returns the SecretKey field if non-nil, zero value otherwise.

### GetSecretKeyOk

`func (o *GetStorageCredentialsResponse) GetSecretKeyOk() (*string, bool)`

GetSecretKeyOk returns a tuple with the SecretKey field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSecretKey

`func (o *GetStorageCredentialsResponse) SetSecretKey(v string)`

SetSecretKey sets SecretKey field to given value.

### GetSessionToken

`func (o *GetStorageCredentialsResponse) GetSessionToken() string`

GetSessionToken returns the SessionToken field if non-nil, zero value otherwise.

### GetSessionTokenOk

`func (o *GetStorageCredentialsResponse) GetSessionTokenOk() (*string, bool)`

GetSessionTokenOk returns a tuple with the SessionToken field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSessionToken

`func (o *GetStorageCredentialsResponse) SetSessionToken(v string)`

SetSessionToken sets SessionToken field to given value.

### HasSessionToken

`func (o *GetStorageCredentialsResponse) HasSessionToken() bool`

HasSessionToken returns a boolean if a field has been set.

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
