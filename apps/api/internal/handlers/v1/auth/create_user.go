package auth

import (
	"errors"
	"fmt"
	"net/mail"

	"github.com/gin-gonic/gin"
	kratos "github.com/ory/kratos-client-go"

	"api/internal/handlers"
	"api/internal/logger"
)

var CreateUserError = errors.New("Failed to create user")

type IdentityName struct {
	First string `json:"first" binding:"required" example:"John"`
	Last  string `json:"last" binding:"required" example:"Doe"`
}

type CreateUserRequest struct {
	Email    string       `json:"email" binding:"required,email" example:"user@example.com"`
	Password string       `json:"password" binding:"required,min=8" example:"securepassword123"`
	Name     IdentityName `json:"name" binding:"required"`
}

func (h *Handler) CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	if _, err := mail.ParseAddress(req.Email); err != nil {
		handlers.NewBadRequestResponse(c, "Invalid email format")
		return
	}

	if len(req.Password) > 72 {
		handlers.NewBadRequestResponse(c, "Password must be at most 72 characters long")
		return
	}

	traits := map[string]any{
		"email": req.Email,
		"name": map[string]any{
			"first": req.Name.First,
			"last":  req.Name.Last,
		},
	}

	body := kratos.CreateIdentityBody{
		SchemaId: "default",
		Traits:   traits,
		Credentials: &kratos.IdentityWithCredentials{
			Password: &kratos.IdentityWithCredentialsPassword{
				Config: &kratos.IdentityWithCredentialsPasswordConfig{
					Password: &req.Password,
				},
			},
		},
	}

	identity, resp, err := h.kratosAdmin.IdentityAPI.CreateIdentity(c.Request.Context()).CreateIdentityBody(body).Execute()
	if err != nil {
		statusCode := 0
		if resp != nil {
			statusCode = resp.StatusCode
		}
		logger.Logger.Error("Failed to create identity", "error", err, "status", statusCode, "email", req.Email)

		if resp != nil {
			switch resp.StatusCode {
			case 409:
				handlers.NewConflictResponse(c, "A user with this email already exists")
				return
			case 400:
				handlers.NewBadRequestResponse(c, "Invalid user data provided")
				return
			}
		}
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", CreateUserError, err))
		return
	}

	handlers.NewSuccessResponse(c, identity)
}
