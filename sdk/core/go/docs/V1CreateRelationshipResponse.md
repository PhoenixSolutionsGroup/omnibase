# V1CreateRelationshipResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | **string** | Success message | 
**Relationship** | [**ClientRelationship**](ClientRelationship.md) | The created relationship | 

## Methods

### NewV1CreateRelationshipResponse

`func NewV1CreateRelationshipResponse(message string, relationship ClientRelationship, ) *V1CreateRelationshipResponse`

NewV1CreateRelationshipResponse instantiates a new V1CreateRelationshipResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewV1CreateRelationshipResponseWithDefaults

`func NewV1CreateRelationshipResponseWithDefaults() *V1CreateRelationshipResponse`

NewV1CreateRelationshipResponseWithDefaults instantiates a new V1CreateRelationshipResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMessage

`func (o *V1CreateRelationshipResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *V1CreateRelationshipResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *V1CreateRelationshipResponse) SetMessage(v string)`

SetMessage sets Message field to given value.


### GetRelationship

`func (o *V1CreateRelationshipResponse) GetRelationship() ClientRelationship`

GetRelationship returns the Relationship field if non-nil, zero value otherwise.

### GetRelationshipOk

`func (o *V1CreateRelationshipResponse) GetRelationshipOk() (*ClientRelationship, bool)`

GetRelationshipOk returns a tuple with the Relationship field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRelationship

`func (o *V1CreateRelationshipResponse) SetRelationship(v ClientRelationship)`

SetRelationship sets Relationship field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


