# V1CreateEmailTemplateRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**HtmlBody** | **string** | HTML email body content | 
**Subject** | **string** | Email subject line | 
**Type** | **string** | Template type identifier (e.g., \&quot;welcome\&quot;, \&quot;password-reset\&quot;) | 

## Methods

### NewV1CreateEmailTemplateRequest

`func NewV1CreateEmailTemplateRequest(htmlBody string, subject string, type_ string, ) *V1CreateEmailTemplateRequest`

NewV1CreateEmailTemplateRequest instantiates a new V1CreateEmailTemplateRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewV1CreateEmailTemplateRequestWithDefaults

`func NewV1CreateEmailTemplateRequestWithDefaults() *V1CreateEmailTemplateRequest`

NewV1CreateEmailTemplateRequestWithDefaults instantiates a new V1CreateEmailTemplateRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetHtmlBody

`func (o *V1CreateEmailTemplateRequest) GetHtmlBody() string`

GetHtmlBody returns the HtmlBody field if non-nil, zero value otherwise.

### GetHtmlBodyOk

`func (o *V1CreateEmailTemplateRequest) GetHtmlBodyOk() (*string, bool)`

GetHtmlBodyOk returns a tuple with the HtmlBody field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHtmlBody

`func (o *V1CreateEmailTemplateRequest) SetHtmlBody(v string)`

SetHtmlBody sets HtmlBody field to given value.


### GetSubject

`func (o *V1CreateEmailTemplateRequest) GetSubject() string`

GetSubject returns the Subject field if non-nil, zero value otherwise.

### GetSubjectOk

`func (o *V1CreateEmailTemplateRequest) GetSubjectOk() (*string, bool)`

GetSubjectOk returns a tuple with the Subject field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubject

`func (o *V1CreateEmailTemplateRequest) SetSubject(v string)`

SetSubject sets Subject field to given value.


### GetType

`func (o *V1CreateEmailTemplateRequest) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *V1CreateEmailTemplateRequest) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *V1CreateEmailTemplateRequest) SetType(v string)`

SetType sets Type field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


