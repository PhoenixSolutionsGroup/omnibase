package email_test

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
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

func TestEmailTenantTemplateScoping(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	ownerID := h.CreateUser(t, client, fmt.Sprintf("owner-tmpl-%s@example.com", id), pw)
	tenant := h.CreateTenant(t, client, ownerID, "Email Templates "+id, fmt.Sprintf("owner-tmpl-%s@example.com", id)).Tenant

	otherOwnerID := h.CreateUser(t, client, fmt.Sprintf("other-owner-tmpl-%s@example.com", id), pw)
	otherTenant := h.CreateTenant(t, client, otherOwnerID, "Other Email Templates "+id, fmt.Sprintf("other-owner-tmpl-%s@example.com", id)).Tenant

	memberID := h.CreateUser(t, client, fmt.Sprintf("member-tmpl-%s@example.com", id), pw)
	invite := h.CreateInvite(t, client, ownerID, tenant.Id, fmt.Sprintf("member-tmpl-%s@example.com", id), "member")
	h.AcceptInvite(t, client, memberID, invite.Token)

	ttype := fmt.Sprintf("tenant-template-%s", id)

	t.Run("owner writes a tenant scoped template", func(t *testing.T) {
		_, resp, err := client.V1ConfigurationAPI.CreateOrUpdateEmailTemplate(helpers.CtxWithUserTenant(ownerID, tenant.Id)).
			UpsertTemplateRequest(sdk.UpsertTemplateRequest{
				Type:     ttype,
				Subject:  "Tenant Subject",
				HtmlBody: "<p>tenant body</p>",
			}).Execute()
		helpers.EnsureOK(t, resp, err, "create tenant template")
	})

	t.Run("other tenant does not see the template", func(t *testing.T) {
		out, resp, err := client.V1ConfigurationAPI.GetEmailTemplates(helpers.CtxWithUserTenant(otherOwnerID, otherTenant.Id)).Execute()
		helpers.EnsureOK(t, resp, err, "getEmailTemplates other tenant")
		for _, tmpl := range out.Templates {
			assert.NotEqual(t, ttype, tmpl.Type, "tenant template leaked to another tenant")
		}
	})

	t.Run("admin list is app wide only", func(t *testing.T) {
		out, resp, err := client.V1ConfigurationAPI.GetEmailTemplates(helpers.Ctx()).Execute()
		helpers.EnsureOK(t, resp, err, "getEmailTemplates admin")
		for _, tmpl := range out.Templates {
			assert.NotEqual(t, ttype, tmpl.Type, "tenant template leaked into app-wide list")
		}
	})

	t.Run("owner serves the tenant template body", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodGet, "/api/v1/email/templates/"+ttype+"/body", nil, map[string]string{
			"X-Service-Key": "",
			"X-App-Key":     testenv.ServiceKey,
			"X-User-Id":     ownerID,
			"X-Tenant-Id":   tenant.Id,
		})
		require.Equal(t, http.StatusOK, resp.StatusCode)
		body, err := io.ReadAll(resp.Body)
		require.NoError(t, err)
		assert.Contains(t, string(body), "tenant body")
	})

	t.Run("member without manage_email_templates gets 403", func(t *testing.T) {
		_, resp, _ := client.V1ConfigurationAPI.CreateOrUpdateEmailTemplate(helpers.CtxWithUserTenant(memberID, tenant.Id)).
			UpsertTemplateRequest(sdk.UpsertTemplateRequest{
				Type:     ttype + "-member",
				Subject:  "Nope",
				HtmlBody: "<p>nope</p>",
			}).Execute()
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusForbidden, resp.StatusCode)
	})

	t.Run("tenant user cannot delete an app wide template", func(t *testing.T) {
		appType := fmt.Sprintf("app-template-%s", id)
		_, resp, err := client.V1ConfigurationAPI.CreateOrUpdateEmailTemplate(helpers.Ctx()).
			UpsertTemplateRequest(sdk.UpsertTemplateRequest{
				Type:     appType,
				Subject:  "App Subject",
				HtmlBody: "<p>app body</p>",
			}).Execute()
		helpers.EnsureOK(t, resp, err, "create app template")

		_, resp, _ = client.V1ConfigurationAPI.DeleteEmailTemplate(helpers.CtxWithUserTenant(ownerID, tenant.Id), appType).Execute()
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)

		_, resp, err = client.V1ConfigurationAPI.DeleteEmailTemplate(helpers.Ctx(), appType).Execute()
		helpers.EnsureOK(t, resp, err, "admin deletes app template")
	})

	t.Run("owner deletes the tenant template", func(t *testing.T) {
		out, resp, err := client.V1ConfigurationAPI.DeleteEmailTemplate(helpers.CtxWithUserTenant(ownerID, tenant.Id), ttype).Execute()
		helpers.EnsureOK(t, resp, err, "delete tenant template")
		require.NotNil(t, out)
		assert.True(t, strings.Contains(out.Message, "deleted"))
	})
}
