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

func TestStorageUpload(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	email := fmt.Sprintf("storage-upload-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)
	userID := h.CreateUser(t, client, email, pw)
	tenant := h.CreateTenant(t, client, userID, "Storage Upload "+id, email).Tenant

	t.Run("upload returns presigned url + id", func(t *testing.T) {
		path := fmt.Sprintf("test/upload-%s.txt", helpers.UniqueID())
		req := sdk.UploadRequest{Path: path}
		out, resp, err := client.V1StorageAPI.UploadFile(helpers.CtxWithUserTenant(userID, tenant.Id)).
			UploadRequest(req).Execute()
		helpers.EnsureOK(t, resp, err, "uploadFile")
		require.NotNil(t, out)
		assert.NotEmpty(t, out.UploadUrl)
		assert.Equal(t, path, out.Path)
		assert.NotEmpty(t, out.Id)
	})

	t.Run("duplicate path on same tenant returns 409", func(t *testing.T) {
		path := fmt.Sprintf("test/dup-%s.txt", helpers.UniqueID())
		req := sdk.UploadRequest{Path: path}
		_, resp, err := client.V1StorageAPI.UploadFile(helpers.CtxWithUserTenant(userID, tenant.Id)).
			UploadRequest(req).Execute()
		helpers.EnsureOK(t, resp, err, "first uploadFile")

		_, resp2, _ := client.V1StorageAPI.UploadFile(helpers.CtxWithUserTenant(userID, tenant.Id)).
			UploadRequest(req).Execute()
		require.NotNil(t, resp2)
		assert.Equal(t, http.StatusConflict, resp2.StatusCode)
	})
}
