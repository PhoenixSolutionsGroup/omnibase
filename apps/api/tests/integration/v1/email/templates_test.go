package email_test

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
	"api/tests/testenv"
)

func TestEmailTemplatesCRUD(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	ttype := fmt.Sprintf("test-template-%s", helpers.UniqueID())

	t.Run("create new template", func(t *testing.T) {
		req := sdk.UpsertTemplateRequest{
			Type:     ttype,
			Subject:  "Subject A",
			HtmlBody: "<h1>Body A</h1>",
		}
		out, resp, err := client.V1ConfigurationAPI.CreateOrUpdateEmailTemplate(helpers.Ctx()).
			UpsertTemplateRequest(req).Execute()
		helpers.EnsureOK(t, resp, err, "createEmailTemplate")
		require.NotNil(t, out)
		require.NotNil(t, out.Template)
		assert.Equal(t, ttype, out.Template.Type)
		assert.Equal(t, "Subject A", out.Template.Subject)
		assert.Equal(t, "<h1>Body A</h1>", out.Template.HtmlBody)
	})

	t.Run("update existing template by type", func(t *testing.T) {
		req := sdk.UpsertTemplateRequest{
			Type:     ttype,
			Subject:  "Subject B",
			HtmlBody: "<h1>Body B</h1>",
		}
		out, resp, err := client.V1ConfigurationAPI.CreateOrUpdateEmailTemplate(helpers.Ctx()).
			UpsertTemplateRequest(req).Execute()
		helpers.EnsureOK(t, resp, err, "updateEmailTemplate")
		require.NotNil(t, out)
		require.NotNil(t, out.Template)
		assert.Equal(t, "Subject B", out.Template.Subject)
		assert.Equal(t, "<h1>Body B</h1>", out.Template.HtmlBody)
	})

	t.Run("list templates contains created type", func(t *testing.T) {
		out, resp, err := client.V1ConfigurationAPI.GetEmailTemplates(helpers.Ctx()).Execute()
		helpers.EnsureOK(t, resp, err, "getEmailTemplates")
		require.NotNil(t, out)
		require.NotNil(t, out.Count)
		assert.GreaterOrEqual(t, out.Count, int64(1))

		found := false
		for _, tmpl := range out.Templates {
			if tmpl.Type == ttype {
				found = true
				assert.Equal(t, "Subject B", tmpl.Subject)
			}
		}
		assert.True(t, found, "created template should appear in list")
	})

	t.Run("delete template", func(t *testing.T) {
		out, resp, err := client.V1ConfigurationAPI.DeleteEmailTemplate(helpers.Ctx(), ttype).Execute()
		helpers.EnsureOK(t, resp, err, "deleteEmailTemplate")
		require.NotNil(t, out)
		assert.NotNil(t, out.Message)
	})

	t.Run("delete missing returns 404", func(t *testing.T) {
		_, resp, _ := client.V1ConfigurationAPI.
			DeleteEmailTemplate(helpers.Ctx(), "does-not-exist-"+helpers.UniqueID()).Execute()
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}
