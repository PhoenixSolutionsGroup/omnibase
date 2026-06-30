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

func TestStorageDeleteObject(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	email := fmt.Sprintf("storage-del-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)
	userID := h.CreateUser(t, client, email, pw)
	tenant := h.CreateTenant(t, client, userID, "Storage Del "+id, email).Tenant

	t.Run("owner deletes uploaded file", func(t *testing.T) {
		path := fmt.Sprintf("test/del-%s.txt", helpers.UniqueID())
		_, uploadResp, err := client.V1StorageAPI.UploadFile(helpers.Ctx()).
			XUserId(userID).XTenantId(tenant.Id).
			UploadRequest(sdk.UploadRequest{Path: path}).Execute()
		helpers.EnsureOK(t, uploadResp, err, "uploadFile")

		out, resp, err := client.V1StorageAPI.DeleteObject(helpers.Ctx()).
			XUserId(userID).XTenantId(tenant.Id).
			DeleteObjectRequest(sdk.DeleteObjectRequest{Path: path}).Execute()
		helpers.EnsureOK(t, resp, err, "deleteObject")
		require.NotNil(t, out)
		assert.NotNil(t, out.Message)

		_, dlResp, _ := client.V1StorageAPI.DownloadFile(helpers.Ctx()).
			XUserId(userID).XTenantId(tenant.Id).
			DownloadRequest(sdk.DownloadRequest{Path: path}).Execute()
		require.NotNil(t, dlResp)
		assert.Equal(t, http.StatusNotFound, dlResp.StatusCode, "deleted file not downloadable")
	})

	t.Run("delete missing returns 404", func(t *testing.T) {
		_, resp, _ := client.V1StorageAPI.DeleteObject(helpers.Ctx()).
			XUserId(userID).XTenantId(tenant.Id).
			DeleteObjectRequest(sdk.DeleteObjectRequest{Path: "test/never-existed-" + helpers.UniqueID()}).Execute()
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}
