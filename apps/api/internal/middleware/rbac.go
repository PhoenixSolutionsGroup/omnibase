package middleware

import (
	"errors"
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/gin-gonic/gin"

	"api/internal/authn"
	"api/internal/authz"
	"api/internal/handlers"
)

type RBACMiddleware struct {
	checker authz.Checker
}

func NewRBACMiddleware(checker authz.Checker) *RBACMiddleware {
	return &RBACMiddleware{checker: checker}
}

func (m *RBACMiddleware) CheckTenantPermission(relation string) gin.HandlerFunc {
	return func(c *gin.Context) {
		principal, ok := authn.Get(c)
		if !ok {
			handlers.NewUnauthorizedResponse(c, "Authentication required")
			c.Abort()
			return
		}

		err := authz.Check(
			c.Request.Context(),
			m.checker,
			principal.Method,
			principal.UserID,
			principal.TenantID,
			"Tenant",
			principal.TenantID.String(),
			relation,
		)
		if err != nil {
			writeAuthzError(c, err)
			return
		}

		c.Next()
	}
}

func writeAuthzError(c *gin.Context, err error) {
	status := http.StatusInternalServerError
	var statusErr huma.StatusError
	if errors.As(err, &statusErr) {
		status = statusErr.GetStatus()
	}

	switch status {
	case http.StatusBadRequest:
		handlers.NewBadRequestResponse(c, err.Error())
	case http.StatusUnauthorized:
		handlers.NewUnauthorizedResponse(c, err.Error())
	case http.StatusForbidden:
		handlers.NewForbiddenResponse(c, err.Error())
	default:
		handlers.NewInternalServerErrorResponse(c, err)
	}
	c.Abort()
}
