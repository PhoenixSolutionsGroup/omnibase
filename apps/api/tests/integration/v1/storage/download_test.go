package storage_test

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

func TestStorageDownload(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	email := fmt.Sprintf("storage-dl-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)
	userID := h.CreateUser(t, client, email, pw)
	tenant := h.CreateTenant(t, client, userID, "Storage DL "+id, email).Tenant

	path := fmt.Sprintf("test/dl-%s.txt", helpers.UniqueID())
	_, uploadResp, err := client.V1StorageAPI.UploadFile(helpers.Ctx()).
		XUserId(userID).XTenantId(tenant.Id).
		UploadRequest(sdk.UploadRequest{Path: path}).Execute()
	helpers.EnsureOK(t, uploadResp, err, "uploadFile")

	t.Run("owner downloads", func(t *testing.T) {
		out, resp, err := client.V1StorageAPI.DownloadFile(helpers.Ctx()).
			XUserId(userID).XTenantId(tenant.Id).
			DownloadRequest(sdk.DownloadRequest{Path: path}).Execute()
		helpers.EnsureOK(t, resp, err, "downloadFile")
		require.NotNil(t, out)
		assert.NotEmpty(t, out.DownloadUrl)
	})

	t.Run("missing path returns 404", func(t *testing.T) {
		_, resp, _ := client.V1StorageAPI.DownloadFile(helpers.Ctx()).
			XUserId(userID).XTenantId(tenant.Id).
			DownloadRequest(sdk.DownloadRequest{Path: "test/never-existed-" + helpers.UniqueID()}).Execute()
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})

	t.Run("non-owner in different tenant gets 404", func(t *testing.T) {
		otherID := helpers.UniqueID()
		otherEmail := fmt.Sprintf("storage-other-%s@example.com", otherID)
		otherUserID := h.CreateUser(t, client, otherEmail, pw)
		otherTenant := h.CreateTenant(t, client, otherUserID, "Storage Other "+otherID, otherEmail).Tenant

		_, resp, _ := client.V1StorageAPI.DownloadFile(helpers.Ctx()).
			XUserId(otherUserID).XTenantId(otherTenant.Id).
			DownloadRequest(sdk.DownloadRequest{Path: path}).Execute()
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}
