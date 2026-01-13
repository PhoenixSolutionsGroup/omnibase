# CreateRelationshipResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | **string** | Success message | 
**Relationship** | [**Relationship**](Relationship.md) |  | 

## Methods

### NewCreateRelationshipResponse

`func NewCreateRelationshipResponse(message string, relationship Relationship, ) *CreateRelationshipResponse`

NewCreateRelationshipResponse instantiates a new CreateRelationshipResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateRelationshipResponseWithDefaults

`func NewCreateRelationshipResponseWithDefaults() *CreateRelationshipResponse`

NewCreateRelationshipResponseWithDefaults instantiates a new CreateRelationshipResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMessage

`func (o *CreateRelationshipResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *CreateRelationshipResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *CreateRelationshipResponse) SetMessage(v string)`

SetMessage sets Message field to given value.


### GetRelationship

`func (o *CreateRelationshipResponse) GetRelationship() Relationship`

GetRelationship returns the Relationship field if non-nil, zero value otherwise.

### GetRelationshipOk

`func (o *CreateRelationshipResponse) GetRelationshipOk() (*Relationship, bool)`

GetRelationshipOk returns a tuple with the Relationship field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRelationship

`func (o *CreateRelationshipResponse) SetRelationship(v Relationship)`

SetRelationship sets Relationship field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


