package tenants_test

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

func TestSwitchActive_NonExistentTenant(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)
	email := fmt.Sprintf("switch-nx-%s@example.com", id)

	userID := h.CreateUser(t, client, email, pw)
	h.CreateTenant(t, client, userID, "Switch User Tenant "+id, email)

	t.Run("unknown target tenant returns 404", func(t *testing.T) {
		resp, _ := h.SwitchActiveTenantRaw(t, client, userID, uuid.NewString())
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}

func TestSwitchActive_NotMember(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)
	aEmail := fmt.Sprintf("switch-a-%s@example.com", id)
	bEmail := fmt.Sprintf("switch-b-%s@example.com", id)

	aID := h.CreateUser(t, client, aEmail, pw)
	bID := h.CreateUser(t, client, bEmail, pw)

	h.CreateTenant(t, client, aID, "Switch A Tenant "+id, aEmail)
	bTenant := h.CreateTenant(t, client, bID, "Switch B Tenant "+id, bEmail).Tenant

	t.Run("user A switching to user B's tenant returns 404", func(t *testing.T) {
		resp, _ := h.SwitchActiveTenantRaw(t, client, aID, bTenant.Id)
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}
