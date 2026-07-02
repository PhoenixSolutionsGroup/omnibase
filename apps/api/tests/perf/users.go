package perf

import (
	"fmt"
	"sync"
	"testing"
	"time"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"
	"github.com/stretchr/testify/require"

	"api/tests/helpers"
)

type User struct {
	ID       string
	Email    string
	Password string
}

func CreateUserPool(t *testing.T, client *sdk.APIClient, n int) []User {
	t.Helper()
	baseID := time.Now().UnixNano()
	users := make([]User, n)
	sem := make(chan struct{}, 10)
	var wg sync.WaitGroup
	var mu sync.Mutex
	var firstErr error

	for i := 0; i < n; i++ {
		wg.Add(1)
		sem <- struct{}{}
		go func(i int) {
			defer wg.Done()
			defer func() { <-sem }()
			email := fmt.Sprintf("perf-%d-%d@example.com", baseID, i)
			password := "PerfPass1!"
			req := sdk.CreateUserRequest{
				Email:    email,
				Password: password,
				Name:     sdk.IdentityName{First: "Perf", Last: fmt.Sprintf("User%d", i)},
			}
			out, resp, err := client.V1AuthAPI.CreateUser(helpers.Ctx()).CreateUserRequest(req).Execute()
			status := 0
			if resp != nil {
				status = resp.StatusCode
			}
			if err != nil || status >= 400 {
				mu.Lock()
				if firstErr == nil {
					firstErr = fmt.Errorf("create user %d: err=%v status=%d", i, err, status)
				}
				mu.Unlock()
				return
			}
			users[i] = User{ID: out.Id, Email: email, Password: password}
		}(i)
	}
	wg.Wait()
	require.NoError(t, firstErr)
	return users
}
