package email

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestBuildMessage_AddsExtraHeaders(t *testing.T) {
	msg := buildMessage("from@example.com", "to@example.com", "Subj", "<p>hi</p>",
		"X-SES-TENANT: b-123", "X-SES-CONFIGURATION-SET: omnibase")

	assert.Contains(t, msg, "X-SES-TENANT: b-123\r\n")
	assert.Contains(t, msg, "X-SES-CONFIGURATION-SET: omnibase\r\n")
	assert.True(t, strings.HasPrefix(msg, "From: from@example.com\r\n"))
}

func TestBuildMessage_NoExtraHeaders(t *testing.T) {
	msg := buildMessage("from@example.com", "to@example.com", "Subj", "<p>hi</p>")
	assert.NotContains(t, msg, "X-SES-TENANT")
	assert.NotContains(t, msg, "\r\n\r\n\r\n")
}

func TestBuildMessageMultipart_AddsExtraHeaders(t *testing.T) {
	msg := buildMessageMultipart("from@example.com", "to@example.com", "Subj", "<p>hi</p>", "plain",
		"X-SES-TENANT: b-123")

	assert.Contains(t, msg, "X-SES-TENANT: b-123\r\n")
	assert.Contains(t, msg, "multipart/alternative")
}

func TestBuildMessageMultipart_FallsBackToSinglePartWithHeaders(t *testing.T) {
	msg := buildMessageMultipart("from@example.com", "to@example.com", "Subj", "<p>hi</p>", "",
		"X-SES-CONFIGURATION-SET: omnibase")

	assert.Contains(t, msg, "X-SES-CONFIGURATION-SET: omnibase\r\n")
	assert.NotContains(t, msg, "multipart/alternative")
}