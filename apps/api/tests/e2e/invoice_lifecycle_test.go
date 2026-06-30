package e2e_test

import (
	"fmt"
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

func TestInvoiceLifecycle(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping e2e test in -short")
	}

	sb := testenv.SetupSandbox(t, "example.config.json")

	id := helpers.UniqueID()
	email := fmt.Sprintf("e2e-invoice-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	userID := h.CreateUser(t, sb.Client, email, pw)
	tenant := h.CreateTenant(t, sb.Client, userID, "E2E Invoice "+id, email).Tenant

	require.NotNil(t, tenant.StripeCustomerId)
	require.NotEmpty(t, *tenant.StripeCustomerId)
	customerID := *tenant.StripeCustomerId

	t.Cleanup(func() {
		_, _ = h.DeleteTenant(t, sb.Client, userID, tenant.Id)
	})

	var invoiceID string

	t.Run("create draft invoice", func(t *testing.T) {
		autoAdvance := false
		desc := "Test invoice " + id
		req := sdk.CreateInvoiceRequest{
			Currency:    "usd",
			AutoAdvance: &autoAdvance,
			Description: &desc,
			Metadata:    map[string]string{"test_run": id},
		}
		out, resp, err := h.CreateInvoiceRaw(t, sb.Client, tenant.Id, req)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.True(t, strings.HasPrefix(out.Id, "in_"), "invoice id should start with in_: %s", out.Id)
		assert.Equal(t, "draft", out.Status)
		invoiceID = out.Id
	})

	require.NotEmpty(t, invoiceID, "invoice creation must succeed before continuing")

	t.Run("get invoice returns matching id and customer", func(t *testing.T) {
		out, resp, err := h.GetInvoiceRaw(t, sb.Client, invoiceID)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Equal(t, invoiceID, out.Id)
		assert.Equal(t, "draft", out.Status)
		assert.Equal(t, customerID, out.CustomerId)
	})

	t.Run("update draft invoice description + metadata", func(t *testing.T) {
		newDesc := "Updated invoice description"
		req := sdk.UpdateInvoiceRequest{
			Description: &newDesc,
			Metadata: map[string]string{
				"test_key": "test_value",
				"order_id": "order_" + id,
			},
		}
		out, resp, err := h.UpdateInvoiceRaw(t, sb.Client, invoiceID, req)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Equal(t, invoiceID, out.Id)
	})

	t.Run("add first line item", func(t *testing.T) {
		req := sdk.AddLineItemRequest{
			Amount:      1500,
			Description: "Platform fee",
			Currency:    "usd",
		}
		out, resp, err := h.AddInvoiceLineItemRaw(t, sb.Client, invoiceID, tenant.Id, req)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.True(t, strings.HasPrefix(out.Id, "ii_"), "line item id should start with ii_: %s", out.Id)
		assert.Equal(t, int64(1500), out.Amount)
		assert.Equal(t, "Platform fee", out.Description)
	})

	t.Run("add second line item", func(t *testing.T) {
		req := sdk.AddLineItemRequest{
			Amount:      500,
			Description: "Service charge",
			Currency:    "usd",
		}
		out, resp, err := h.AddInvoiceLineItemRaw(t, sb.Client, invoiceID, tenant.Id, req)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Equal(t, int64(500), out.Amount)
	})

	t.Run("finalize invoice transitions to open with summed total", func(t *testing.T) {
		out, resp, err := h.FinalizeInvoiceRaw(t, sb.Client, invoiceID, false)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Equal(t, "open", out.Status)
		assert.Equal(t, int64(2000), out.AmountDue, "expected 1500 + 500 = 2000")
	})

	t.Run("verify finalized invoice has hosted url", func(t *testing.T) {
		out, resp, err := h.GetInvoiceRaw(t, sb.Client, invoiceID)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Equal(t, "open", out.Status)
		require.NotNil(t, out.HostedInvoiceUrl)
		assert.NotEmpty(t, *out.HostedInvoiceUrl)
	})

	t.Run("cannot update finalized invoice", func(t *testing.T) {
		desc := "Should fail"
		req := sdk.UpdateInvoiceRequest{Description: &desc}
		_, resp, _ := h.UpdateInvoiceRaw(t, sb.Client, invoiceID, req)
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})
}
