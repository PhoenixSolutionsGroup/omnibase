package email_test

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
	"api/tests/testenv"
)

func TestEmailSend(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	t.Run("send html only", func(t *testing.T) {
		req := sdk.SendRequest{
			To:      fmt.Sprintf("recipient-%s@example.com", helpers.UniqueID()),
			Subject: "Send Test HTML",
			Body:    "<p>hello</p>",
		}
		out, resp, err := client.V1ConfigurationAPI.SendEmail(helpers.Ctx()).
			SendRequest(req).Execute()
		helpers.EnsureOK(t, resp, err, "sendEmail html")
		require.NotNil(t, out)
		assert.NotNil(t, out.Message)
	})

	t.Run("send multipart with plain", func(t *testing.T) {
		plain := "hello plain"
		req := sdk.SendRequest{
			To:      fmt.Sprintf("recipient-%s@example.com", helpers.UniqueID()),
			Subject: "Send Test Multipart",
			Body:    "<p>hello</p>",
			Plain:   &plain,
		}
		out, resp, err := client.V1ConfigurationAPI.SendEmail(helpers.Ctx()).
			SendRequest(req).Execute()
		helpers.EnsureOK(t, resp, err, "sendEmail multipart")
		require.NotNil(t, out)
		assert.NotNil(t, out.Message)
	})
}
