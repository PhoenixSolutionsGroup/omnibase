package v1

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/require"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
)

func CreateTenant(t *testing.T, client *sdk.APIClient, userID, name, billingEmail string) *sdk.CreateTenantResponse {
	t.Helper()
	req := sdk.CreateTenantRequest{
		Name:         name,
		BillingEmail: billingEmail,
		Type:         "organization",
	}
	out, resp, err := client.V1TenantsLifecycleAPI.CreateTenant(helpers.CtxWithUser(userID)).
		CreateTenantRequest(req).
		Execute()
	helpers.EnsureOK(t, resp, err, "createTenant")
	require.NotNil(t, out)
	require.NotEmpty(t, out.Tenant.Id)
	return out
}

func CreateInvite(t *testing.T, client *sdk.APIClient, ownerID, tenantID, email, role string) *sdk.AuthTenantInvite {
	t.Helper()
	req := sdk.CreateRequest{
		Email:     email,
		Role:      role,
		InviteUrl: "http://localhost:3000/accept-invite",
	}
	out, resp, err := client.V1TenantsInvitesAPI.CreateInvite(helpers.CtxWithUserTenant(ownerID, tenantID)).
		CreateRequest(req).
		Execute()
	helpers.EnsureOK(t, resp, err, "createInvite")
	require.NotNil(t, out)
	require.NotEmpty(t, out.Invite.Token)
	return &out.Invite
}

func CreateInviteRaw(t *testing.T, client *sdk.APIClient, callerUserID, tenantID, email, role string) (*http.Response, error) {
	t.Helper()
	req := sdk.CreateRequest{
		Email:     email,
		Role:      role,
		InviteUrl: "http://localhost:3000/accept-invite",
	}
	_, resp, err := client.V1TenantsInvitesAPI.CreateInvite(helpers.CtxWithUserTenant(callerUserID, tenantID)).
		CreateRequest(req).
		Execute()
	return resp, err
}

func AcceptInvite(t *testing.T, client *sdk.APIClient, userID, token string) *sdk.AcceptResponse {
	t.Helper()
	req := sdk.AcceptRequest{Token: token}
	out, resp, err := client.V1TenantsInvitesAPI.AcceptInvite(helpers.CtxWithUser(userID)).
		AcceptRequest(req).
		Execute()
	helpers.EnsureOK(t, resp, err, "acceptInvite")
	require.NotNil(t, out)
	return out
}

func AcceptInviteRaw(t *testing.T, client *sdk.APIClient, userID, token string) (*http.Response, error) {
	t.Helper()
	req := sdk.AcceptRequest{Token: token}
	_, resp, err := client.V1TenantsInvitesAPI.AcceptInvite(helpers.CtxWithUser(userID)).
		AcceptRequest(req).
		Execute()
	return resp, err
}

func ListTenantUsers(t *testing.T, client *sdk.APIClient, userID, tenantID string) []sdk.UserResponse {
	t.Helper()
	out, resp, err := client.V1TenantsUsersAPI.ListTenantUsers(helpers.CtxWithUserTenant(userID, tenantID)).
		Execute()
	helpers.EnsureOK(t, resp, err, "listTenantUsers")
	return out
}

func ListTenantUsersRaw(t *testing.T, client *sdk.APIClient, userID, tenantID string) (*http.Response, error) {
	t.Helper()
	_, resp, err := client.V1TenantsUsersAPI.ListTenantUsers(helpers.CtxWithUserTenant(userID, tenantID)).
		Execute()
	return resp, err
}

func ListUserTenants(t *testing.T, client *sdk.APIClient, userID string) []sdk.UserTenantListItem {
	t.Helper()
	out, resp, err := client.V1AuthAPI.ListTenants(helpers.CtxWithUser(userID)).
		Execute()
	helpers.EnsureOK(t, resp, err, "listTenants")
	require.NotNil(t, out)
	return out.Tenants
}

func GetTenantJWT(t *testing.T, client *sdk.APIClient, userID, tenantID string) string {
	t.Helper()
	out, resp, err := client.V1TenantsLifecycleAPI.GetTenantJWT(helpers.CtxWithUserTenant(userID, tenantID)).
		Execute()
	helpers.EnsureOK(t, resp, err, "getTenantJWT")
	require.NotNil(t, out)
	return out.Token
}

func GetTenantJWTRaw(t *testing.T, client *sdk.APIClient, userID, tenantID string) (*http.Response, error) {
	t.Helper()
	_, resp, err := client.V1TenantsLifecycleAPI.GetTenantJWT(helpers.CtxWithUserTenant(userID, tenantID)).
		Execute()
	return resp, err
}

func SwitchActiveTenant(t *testing.T, client *sdk.APIClient, userID, tenantID string) string {
	t.Helper()
	req := sdk.SwitchActiveRequest{TenantId: tenantID}
	out, resp, err := client.V1TenantsLifecycleAPI.SwitchActiveTenant(helpers.CtxWithUser(userID)).
		SwitchActiveRequest(req).
		Execute()
	helpers.EnsureOK(t, resp, err, "switchActiveTenant")
	require.NotNil(t, out)
	return out.Token
}

func SwitchActiveTenantRaw(t *testing.T, client *sdk.APIClient, userID, tenantID string) (*http.Response, error) {
	t.Helper()
	req := sdk.SwitchActiveRequest{TenantId: tenantID}
	_, resp, err := client.V1TenantsLifecycleAPI.SwitchActiveTenant(helpers.CtxWithUser(userID)).
		SwitchActiveRequest(req).
		Execute()
	return resp, err
}

func DeleteTenant(t *testing.T, client *sdk.APIClient, userID, tenantID string) (*http.Response, error) {
	t.Helper()
	_, resp, err := client.V1TenantsLifecycleAPI.DeleteTenant(helpers.CtxWithUserTenant(userID, tenantID)).
		Execute()
	return resp, err
}

func ListRoles(t *testing.T, client *sdk.APIClient, tenantID string) []sdk.ListRolesByTenantRow {
	t.Helper()
	out, resp, err := client.V1TenantsRolesAPI.ListRoles(helpers.CtxWithTenant(tenantID)).
		Execute()
	helpers.EnsureOK(t, resp, err, "listRoles")
	return out
}

func CreateRole(t *testing.T, client *sdk.APIClient, userID, tenantID, name string, permissions []string) *sdk.CreateRoleRow {
	t.Helper()
	req := sdk.CreateRoleRequest{RoleName: name, Permissions: permissions}
	out, resp, err := client.V1TenantsRolesAPI.CreateRole(helpers.CtxWithUserTenant(userID, tenantID)).
		CreateRoleRequest(req).
		Execute()
	helpers.EnsureOK(t, resp, err, "createRole")
	require.NotNil(t, out)
	require.NotEmpty(t, out.Id)
	return out
}

func UpdateRole(t *testing.T, client *sdk.APIClient, userID, tenantID, roleID string, permissions []string) *sdk.UpdateRolePermissionsRow {
	t.Helper()
	req := sdk.UpdateRoleRequest{Permissions: permissions}
	out, resp, err := client.V1TenantsRolesAPI.UpdateRole(helpers.CtxWithUserTenant(userID, tenantID), roleID).
		UpdateRoleRequest(req).
		Execute()
	helpers.EnsureOK(t, resp, err, "updateRole")
	require.NotNil(t, out)
	return out
}

func DeleteRole(t *testing.T, client *sdk.APIClient, userID, tenantID, roleID string) {
	t.Helper()
	_, resp, err := client.V1TenantsRolesAPI.DeleteRole(helpers.CtxWithUserTenant(userID, tenantID), roleID).
		Execute()
	helpers.EnsureOK(t, resp, err, "deleteRole")
}

func UpdateTenantUserRole(t *testing.T, client *sdk.APIClient, ownerID, tenantID, targetUserID, role string) (*http.Response, error) {
	t.Helper()
	req := sdk.UpdateUserRoleRequest{UserId: targetUserID, Role: role}
	_, resp, err := client.V1TenantsUsersAPI.UpdateTenantUserRole(helpers.CtxWithUserTenant(ownerID, tenantID)).
		UpdateUserRoleRequest(req).
		Execute()
	return resp, err
}

func RemoveTenantUser(t *testing.T, client *sdk.APIClient, callerUserID, tenantID, targetUserID string) (*http.Response, error) {
	t.Helper()
	req := sdk.DeleteRequest{UserId: targetUserID}
	_, resp, err := client.V1TenantsUsersAPI.RemoveTenantUser(helpers.CtxWithUserTenant(callerUserID, tenantID)).
		DeleteRequest(req).
		Execute()
	return resp, err
}

func GetTenantByID(t *testing.T, client *sdk.APIClient, tenantID string) (*sdk.GetTenantByIDRow, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1TenantsLifecycleAPI.GetTenantByID(helpers.Ctx(), tenantID).Execute()
	if err != nil || out == nil {
		return nil, resp, err
	}
	return out, resp, nil
}

func GetTenantByStripeCustomerID(t *testing.T, client *sdk.APIClient, stripeCustomerID string) (*sdk.GetTenantByStripeCustomerIDRow, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1TenantsLifecycleAPI.GetTenantByStripeCustomerID(helpers.Ctx(), stripeCustomerID).Execute()
	if err != nil || out == nil {
		return nil, resp, err
	}
	return out, resp, nil
}

func CheckTenantPermission(t *testing.T, client *sdk.APIClient, tenantID, relation, subjUserID string) bool {
	t.Helper()
	req := sdk.CheckRequest{
		Namespace: "Tenant",
		Object:    tenantID,
		Relation:  relation,
		SubjectSet: sdk.SubjectSetRequest{
			Namespace: "User",
			Object:    subjUserID,
		},
	}
	out, resp, err := client.V1PermissionsAPI.CheckPermission(helpers.Ctx()).
		CheckRequest(req).
		Execute()
	helpers.EnsureOK(t, resp, err, "checkPermission")
	require.NotNil(t, out)
	return out.Allowed
}
