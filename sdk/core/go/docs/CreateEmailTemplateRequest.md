# CreateEmailTemplateRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Type** | **string** | Template type identifier (e.g., \&quot;welcome\&quot;, \&quot;password-reset\&quot;) | 
**Subject** | **string** | Email subject line | 
**HtmlBody** | **string** | HTML email body content | 

## Methods

### NewCreateEmailTemplateRequest

`func NewCreateEmailTemplateRequest(type_ string, subject string, htmlBody string, ) *CreateEmailTemplateRequest`

NewCreateEmailTemplateRequest instantiates a new CreateEmailTemplateRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateEmailTemplateRequestWithDefaults

`func NewCreateEmailTemplateRequestWithDefaults() *CreateEmailTemplateRequest`

NewCreateEmailTemplateRequestWithDefaults instantiates a new CreateEmailTemplateRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetType

`func (o *CreateEmailTemplateRequest) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *CreateEmailTemplateRequest) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *CreateEmailTemplateRequest) SetType(v string)`

SetType sets Type field to given value.


### GetSubject

`func (o *CreateEmailTemplateRequest) GetSubject() string`

GetSubject returns the Subject field if non-nil, zero value otherwise.

### GetSubjectOk

`func (o *CreateEmailTemplateRequest) GetSubjectOk() (*string, bool)`

GetSubjectOk returns a tuple with the Subject field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubject

`func (o *CreateEmailTemplateRequest) SetSubject(v string)`

SetSubject sets Subject field to given value.


### GetHtmlBody

`func (o *CreateEmailTemplateRequest) GetHtmlBody() string`

GetHtmlBody returns the HtmlBody field if non-nil, zero value otherwise.

### GetHtmlBodyOk

`func (o *CreateEmailTemplateRequest) GetHtmlBodyOk() (*string, bool)`

GetHtmlBodyOk returns a tuple with the HtmlBody field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHtmlBody

`func (o *CreateEmailTemplateRequest) SetHtmlBody(v string)`

SetHtmlBody sets HtmlBody field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


