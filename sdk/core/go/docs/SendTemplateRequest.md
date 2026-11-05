# SendTemplateRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Data** | Pointer to **map[string]interface{}** |  | [optional] 
**TemplateType** | **string** |  | 
**To** | **string** |  | 

## Methods

### NewSendTemplateRequest

`func NewSendTemplateRequest(templateType string, to string, ) *SendTemplateRequest`

NewSendTemplateRequest instantiates a new SendTemplateRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSendTemplateRequestWithDefaults

`func NewSendTemplateRequestWithDefaults() *SendTemplateRequest`

NewSendTemplateRequestWithDefaults instantiates a new SendTemplateRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetData

`func (o *SendTemplateRequest) GetData() map[string]interface{}`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *SendTemplateRequest) GetDataOk() (*map[string]interface{}, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *SendTemplateRequest) SetData(v map[string]interface{})`

SetData sets Data field to given value.

### HasData

`func (o *SendTemplateRequest) HasData() bool`

HasData returns a boolean if a field has been set.

### GetTemplateType

`func (o *SendTemplateRequest) GetTemplateType() string`

GetTemplateType returns the TemplateType field if non-nil, zero value otherwise.

### GetTemplateTypeOk

`func (o *SendTemplateRequest) GetTemplateTypeOk() (*string, bool)`

GetTemplateTypeOk returns a tuple with the TemplateType field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTemplateType

`func (o *SendTemplateRequest) SetTemplateType(v string)`

SetTemplateType sets TemplateType field to given value.


### GetTo

`func (o *SendTemplateRequest) GetTo() string`

GetTo returns the To field if non-nil, zero value otherwise.

### GetToOk

`func (o *SendTemplateRequest) GetToOk() (*string, bool)`

GetToOk returns a tuple with the To field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTo

`func (o *SendTemplateRequest) SetTo(v string)`

SetTo sets To field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


