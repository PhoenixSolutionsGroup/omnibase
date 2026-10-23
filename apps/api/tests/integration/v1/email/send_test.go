package email_test

import (
	"context"
	"fmt"
	"net/http"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
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
		to := fmt.Sprintf("recipient-%s@example.com", helpers.UniqueID())
		req := sdk.SendHTMLRequest{
			To:      to,
			Subject: "Send Test HTML",
			Body:    "<p>hello</p>",
		}
		out, resp, err := client.V1ConfigurationAPI.SendEmailHTML(helpers.Ctx()).
			SendHTMLRequest(req).Execute()
		helpers.EnsureOK(t, resp, err, "sendEmailHTML")
		require.NotNil(t, out)
		assert.NotNil(t, out.Message)

		subject, html, templateType, tenantID, data := latestHistory(t, env, to)
		assert.Equal(t, "Send Test HTML", subject)
		assert.Equal(t, "<p>hello</p>", html)
		assert.Nil(t, templateType)
		assert.Nil(t, tenantID)
		assert.Nil(t, data)
	})

	t.Run("send multipart with plain", func(t *testing.T) {
		plain := "hello plain"
		req := sdk.SendHTMLRequest{
			To:      fmt.Sprintf("recipient-%s@example.com", helpers.UniqueID()),
			Subject: "Send Test Multipart",
			Body:    "<p>hello</p>",
			Plain:   &plain,
		}
		out, resp, err := client.V1ConfigurationAPI.SendEmailHTML(helpers.Ctx()).
			SendHTMLRequest(req).Execute()
		helpers.EnsureOK(t, resp, err, "sendEmailHTML multipart")
		require.NotNil(t, out)
		assert.NotNil(t, out.Message)
	})

	t.Run("unauthenticated send returns 401", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodPost, "/api/v1/email/send/html",
			[]byte(`{"to":"user@example.com","subject":"Hi","body":"<p>Hi</p>"}`),
			map[string]string{"X-Service-Key": ""})
		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("template send requires template_type", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodPost, "/api/v1/email/send",
			[]byte(`{"to":"user@example.com"}`), nil)
		assert.Equal(t, http.StatusUnprocessableEntity, resp.StatusCode)
	})

	t.Run("html send requires body", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodPost, "/api/v1/email/send/html",
			[]byte(`{"to":"user@example.com","subject":"Hi"}`), nil)
		assert.Equal(t, http.StatusUnprocessableEntity, resp.StatusCode)
	})

	t.Run("unknown template returns 404", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodPost, "/api/v1/email/send",
			[]byte(`{"to":"user@example.com","template_type":"does-not-exist"}`), nil)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})

	id := helpers.UniqueID()
	ownerEmail := fmt.Sprintf("owner-send-%s@example.com", id)
	memberEmail := fmt.Sprintf("member-send-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	ownerID := h.CreateUser(t, client, ownerEmail, pw)
	tenant := h.CreateTenant(t, client, ownerID, "Email Send "+id, ownerEmail).Tenant
	memberID := h.CreateUser(t, client, memberEmail, pw)
	invite := h.CreateInvite(t, client, ownerID, tenant.Id, memberEmail, "member")
	h.AcceptInvite(t, client, memberID, invite.Token)

	t.Run("member without send_email gets 403", func(t *testing.T) {
		req := sdk.SendHTMLRequest{
			To:      fmt.Sprintf("recipient-%s@example.com", helpers.UniqueID()),
			Subject: "Nope",
			Body:    "<p>nope</p>",
		}
		_, resp, _ := client.V1ConfigurationAPI.SendEmailHTML(helpers.CtxWithUserTenant(memberID, tenant.Id)).
			SendHTMLRequest(req).Execute()
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusForbidden, resp.StatusCode)
	})

	t.Run("owner with send_email can send", func(t *testing.T) {
		req := sdk.SendHTMLRequest{
			To:      fmt.Sprintf("recipient-%s@example.com", helpers.UniqueID()),
			Subject: "Owner Send",
			Body:    "<p>owner</p>",
		}
		out, resp, err := client.V1ConfigurationAPI.SendEmailHTML(helpers.CtxWithUserTenant(ownerID, tenant.Id)).
			SendHTMLRequest(req).Execute()
		helpers.EnsureOK(t, resp, err, "sendEmailHTML owner")
		require.NotNil(t, out)
	})

	t.Run("owner sends a tenant scoped template", func(t *testing.T) {
		ttype := fmt.Sprintf("tenant-send-%s", id)
		_, resp, err := client.V1ConfigurationAPI.CreateOrUpdateEmailTemplate(helpers.CtxWithUserTenant(ownerID, tenant.Id)).
			UpsertTemplateRequest(sdk.UpsertTemplateRequest{
				Type:     ttype,
				Subject:  "Hello {{.Name}}",
				HtmlBody: "<p>Hello {{.Name}}</p>",
			}).Execute()
		helpers.EnsureOK(t, resp, err, "create tenant template for send")

		to := fmt.Sprintf("recipient-%s@example.com", helpers.UniqueID())
		out, resp, err := client.V1ConfigurationAPI.SendEmail(helpers.CtxWithUserTenant(ownerID, tenant.Id)).
			SendTemplateRequest(sdk.SendTemplateRequest{
				To:           to,
				TemplateType: ttype,
				Data:         map[string]interface{}{"Name": "Ada"},
			}).Execute()
		helpers.EnsureOK(t, resp, err, "sendEmail template")
		require.NotNil(t, out)

		subject, html, templateType, tenantID, data := latestHistory(t, env, to)
		assert.Equal(t, "Hello Ada", subject)
		assert.Equal(t, "<p>Hello Ada</p>", html)
		require.NotNil(t, templateType)
		assert.Equal(t, ttype, *templateType)
		require.NotNil(t, tenantID)
		assert.Equal(t, tenant.Id, *tenantID)
		assert.JSONEq(t, `{"Name":"Ada"}`, string(data))
	})

	t.Run("per tenant rate limit", func(t *testing.T) {
		limitID := helpers.UniqueID()
		limitEmail := fmt.Sprintf("limit-owner-%s@example.com", limitID)
		limitUser := h.CreateUser(t, client, limitEmail, pw)
		limitTenant := h.CreateTenant(t, client, limitUser, "Email Limit "+limitID, limitEmail).Tenant

		for i := 0; i < 10; i++ {
			req := sdk.SendHTMLRequest{
				To:      fmt.Sprintf("limit-%d-%s@example.com", i, limitID),
				Subject: "Limit",
				Body:    "<p>limit</p>",
			}
			_, resp, err := client.V1ConfigurationAPI.SendEmailHTML(helpers.CtxWithUserTenant(limitUser, limitTenant.Id)).
				SendHTMLRequest(req).Execute()
			helpers.EnsureOK(t, resp, err, fmt.Sprintf("rate limit send %d", i))
		}

		req := sdk.SendHTMLRequest{
			To:      fmt.Sprintf("limit-over-%s@example.com", limitID),
			Subject: "Limit Over",
			Body:    "<p>limit over</p>",
		}
		_, resp, _ := client.V1ConfigurationAPI.SendEmailHTML(helpers.CtxWithUserTenant(limitUser, limitTenant.Id)).
			SendHTMLRequest(req).Execute()
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusTooManyRequests, resp.StatusCode)
	})
}

func latestHistory(t *testing.T, env *testenv.Env, to string) (subject, html string, templateType, tenantID *string, data []byte) {
	t.Helper()

	ctx := context.Background()
	conn, err := pgx.Connect(ctx, env.PostgresDSN)
	require.NoError(t, err)
	t.Cleanup(func() {
		conn.Close(context.Background())
	})

	err = conn.QueryRow(ctx,
		`SELECT subject, html_body, template_type, tenant_id, template_data
		 FROM email.history
		 WHERE to_email = $1
		 ORDER BY created_at DESC
		 LIMIT 1`,
		to,
	).Scan(&subject, &html, &templateType, &tenantID, &data)
	require.NoError(t, err)
	return subject, html, templateType, tenantID, data
}
