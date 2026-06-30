package auth

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"api/internal/logger"

	kratos "github.com/ory/kratos-client-go"
)

var SetInTenantError = errors.New("Failed to set in_tenant metadata")

func (s *Service) SetInTenant(ctx context.Context, userID string, inTenant bool) error {
	logger.Logger.Debug("Patching is_in_tenant", "user_id", userID, "in_tenant", inTenant)

	patch := []kratos.JsonPatch{{
		Op:    "replace",
		Path:  "/metadata_public/is_in_tenant",
		Value: inTenant,
	}}

	_, resp, err := s.admin.IdentityAPI.PatchIdentity(ctx, userID).JsonPatch(patch).Execute()
	if err != nil {
		if resp != nil && resp.StatusCode == http.StatusNotFound {
			logger.Logger.Warn("Identity not found, skipping metadata update", "user_id", userID)
			return nil
		}
		return fmt.Errorf("%w: %w", SetInTenantError, err)
	}
	return nil
}
