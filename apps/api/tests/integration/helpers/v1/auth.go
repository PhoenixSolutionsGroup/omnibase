package v1

import (
	"testing"

	"github.com/stretchr/testify/require"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/integration/helpers"
)

func CreateUser(t *testing.T, client *sdk.APIClient, email, password string) string {
	t.Helper()
	req := sdk.CreateUserRequest{
		Email:    email,
		Password: password,
		Name:     sdk.CreateUserRequestName{First: "Test", Last: "User"},
	}
	out, resp, err := client.V1AuthAPI.CreateUser(helpers.Ctx()).CreateUserRequest(req).Execute()
	helpers.EnsureOK(t, resp, err, "createUser")
	require.NotNil(t, out)
	require.NotEmpty(t, out.Id)
	return out.Id
}
