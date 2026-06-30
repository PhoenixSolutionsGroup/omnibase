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

func TestStorageMakePublic(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	email := fmt.Sprintf("storage-mp-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)
	userID := h.CreateUser(t, client, email, pw)
	tenant := h.CreateTenant(t, client, userID, "Storage MP "+id, email).Tenant

	path := fmt.Sprintf("test/mp-%s.txt", helpers.UniqueID())
	_, uploadResp, err := client.V1StorageAPI.UploadFile(helpers.Ctx()).
		XUserId(userID).XTenantId(tenant.Id).
		UploadRequest(sdk.UploadRequest{Path: path}).Execute()
	helpers.EnsureOK(t, uploadResp, err, "uploadFile")

	t.Run("owner makes file public", func(t *testing.T) {
		out, resp, err := client.V1StorageAPI.MakeFilePublic(helpers.Ctx()).
			XUserId(userID).XTenantId(tenant.Id).
			MakePublicRequest(sdk.MakePublicRequest{Path: path}).Execute()
		helpers.EnsureOK(t, resp, err, "makeFilePublic")
		require.NotNil(t, out)
		assert.NotNil(t, out.Message)
	})

	t.Run("idempotent on already public", func(t *testing.T) {
		out, resp, err := client.V1StorageAPI.MakeFilePublic(helpers.Ctx()).
			XUserId(userID).XTenantId(tenant.Id).
			MakePublicRequest(sdk.MakePublicRequest{Path: path}).Execute()
		helpers.EnsureOK(t, resp, err, "makeFilePublic again")
		require.NotNil(t, out)
	})

	t.Run("missing path returns 404", func(t *testing.T) {
		_, resp, _ := client.V1StorageAPI.MakeFilePublic(helpers.Ctx()).
			XUserId(userID).XTenantId(tenant.Id).
			MakePublicRequest(sdk.MakePublicRequest{Path: "test/never-existed-" + helpers.UniqueID()}).Execute()
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}
