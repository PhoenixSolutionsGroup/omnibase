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

func TestStorageSharing(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	password := fmt.Sprintf("pwd-%s-aZ09!", id)
	ownerEmail := fmt.Sprintf("owner-%s@example.com", id)
	memberEmail := fmt.Sprintf("member-%s@example.com", id)

	ownerID := h.CreateUser(t, client, ownerEmail, password)
	memberID := h.CreateUser(t, client, memberEmail, password)

	tenant := h.CreateTenant(t, client, ownerID, "Storage Share "+id, ownerEmail).Tenant

	invite := h.CreateInvite(t, client, ownerID, tenant.Id, memberEmail, "member")
	h.AcceptInvite(t, client, memberID, invite.Token)

	path := fmt.Sprintf("test/share-%s.txt", helpers.UniqueID())
	upOut, upResp, upErr := client.V1StorageAPI.UploadFile(helpers.CtxWithUserTenant(ownerID, tenant.Id)).
		UploadRequest(sdk.UploadRequest{Path: path}).Execute()
	helpers.EnsureOK(t, upResp, upErr, "uploadFile")
	require.NotNil(t, upOut)
	require.NotEmpty(t, upOut.Id)
	fileID := upOut.Id

	t.Run("member_cannot_download_without_permission", func(t *testing.T) {
		_, resp, _ := client.V1StorageAPI.DownloadFile(helpers.CtxWithUserTenant(memberID, tenant.Id)).
			DownloadRequest(sdk.DownloadRequest{Path: path}).Execute()
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusForbidden, resp.StatusCode)
	})

	t.Run("owner_grants_can_read_to_member", func(t *testing.T) {
		req := sdk.CreateRelationshipRequest{
			Namespace: "StorageObject",
			Object:    fileID,
			Relation:  "can_read",
			SubjectSet: sdk.SubjectSetRequest{
				Namespace: "User",
				Object:    memberID,
			},
		}
		_, resp, err := client.V1PermissionsAPI.CreateRelationship(helpers.CtxWithUserTenant(ownerID, tenant.Id)).
			CreateRelationshipRequest(req).Execute()
		helpers.EnsureOK(t, resp, err, "createRelationship can_read")
	})

	t.Run("member_can_download_after_grant", func(t *testing.T) {
		out, resp, err := client.V1StorageAPI.DownloadFile(helpers.CtxWithUserTenant(memberID, tenant.Id)).
			DownloadRequest(sdk.DownloadRequest{Path: path}).Execute()
		helpers.EnsureOK(t, resp, err, "downloadFile as member")
		require.NotNil(t, out)
		assert.NotEmpty(t, out.DownloadUrl)
	})

	t.Run("member_cannot_delete_with_only_can_read", func(t *testing.T) {
		_, resp, _ := client.V1StorageAPI.DeleteObject(helpers.CtxWithUserTenant(memberID, tenant.Id)).
			DeleteObjectRequest(sdk.DeleteObjectRequest{Path: path}).Execute()
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusForbidden, resp.StatusCode)
	})
}
