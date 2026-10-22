package authz

import (
	"context"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"

	"api/internal/authn"
	"api/internal/logger"
	"api/internal/services/permissions"
)

type Checker interface {
	Check(ctx context.Context, namespace, object, relation string, subject permissions.SubjectSet) (bool, error)
}

func Check(ctx context.Context, checker Checker, method authn.AuthMethod, userID, tenantID uuid.UUID, namespace, object, relation string) error {
	if method == authn.AuthServiceKey {
		return nil
	}

	if method == authn.AuthNone || userID == uuid.Nil || tenantID == uuid.Nil {
		return huma.Error401Unauthorized("Authentication required")
	}

	if _, err := uuid.Parse(object); err != nil {
		return huma.Error400BadRequest("Invalid object id")
	}

	subject := permissions.SubjectSet{Namespace: "User", Object: userID.String()}
	allowed, err := checker.Check(ctx, namespace, object, relation, subject)
	if err != nil {
		logger.Logger.Error("Failed to check permission",
			"namespace", namespace,
			"object", object,
			"relation", relation,
			"user_id", userID,
			"tenant_id", tenantID,
			"error", err)
		return huma.Error500InternalServerError("Failed to check permission")
	}

	if !allowed {
		return huma.Error403Forbidden(fmt.Sprintf("Insufficient permissions - must have `%s` permission", relation))
	}

	return nil
}
