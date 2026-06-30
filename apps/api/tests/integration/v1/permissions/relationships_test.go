package permissions_test

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

func TestPermissionsRelationships(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	email := fmt.Sprintf("perms-rel-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)
	userID := h.CreateUser(t, client, email, pw)
	tenant := h.CreateTenant(t, client, userID, "Perms Rel "+id, email).Tenant

	t.Run("check returns allowed for owner relation", func(t *testing.T) {
		req := sdk.CheckRequest{
			Namespace: "Tenant",
			Object:    tenant.Id,
			Relation:  "delete_tenant",
			SubjectSet: sdk.SubjectSetRequest{
				Namespace: "User",
				Object:    userID,
			},
		}
		out, resp, err := client.V1PermissionsAPI.CheckPermission(helpers.Ctx()).
			CheckRequest(req).Execute()
		helpers.EnsureOK(t, resp, err, "checkPermission")
		require.NotNil(t, out)
		assert.True(t, out.Allowed)
	})

	t.Run("check denies non-owner", func(t *testing.T) {
		otherID := helpers.UniqueID()
		otherEmail := fmt.Sprintf("perms-other-%s@example.com", otherID)
		otherUserID := h.CreateUser(t, client, otherEmail, pw)

		req := sdk.CheckRequest{
			Namespace: "Tenant",
			Object:    tenant.Id,
			Relation:  "delete_tenant",
			SubjectSet: sdk.SubjectSetRequest{
				Namespace: "User",
				Object:    otherUserID,
			},
		}
		out, resp, err := client.V1PermissionsAPI.CheckPermission(helpers.Ctx()).
			CheckRequest(req).Execute()
		helpers.EnsureOK(t, resp, err, "checkPermission non-owner")
		require.NotNil(t, out)
		assert.False(t, out.Allowed)
	})

	t.Run("create with unknown namespace returns 404", func(t *testing.T) {
		req := sdk.CreateRelationshipRequest{
			Namespace: "TotallyMadeUpNamespace_" + helpers.UniqueID(),
			Object:    "anything",
			Relation:  "read",
			SubjectSet: sdk.SubjectSetRequest{
				Namespace: "User",
				Object:    userID,
			},
		}
		_, resp, _ := client.V1PermissionsAPI.CreateRelationship(helpers.Ctx()).
			CreateRelationshipRequest(req).Execute()
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})

	t.Run("delete non-existent is idempotent", func(t *testing.T) {
		req := sdk.DeleteRelationshipRequest{
			Namespace: "Tenant",
			Object:    tenant.Id,
			Relation:  "can_view_users",
			SubjectSet: sdk.SubjectSetRequest{
				Namespace: "User",
				Object:    "00000000-0000-0000-0000-000000000000",
			},
		}
		_, resp, err := client.V1PermissionsAPI.DeleteRelationship(helpers.Ctx()).
			DeleteRelationshipRequest(req).Execute()
		helpers.EnsureOK(t, resp, err, "deleteRelationship missing tuple")
	})

}
