package auth

import (
	"context"
	"errors"
	"fmt"
	"net/mail"

	"github.com/danielgtaylor/huma/v2"
	kratos "github.com/ory/kratos-client-go"

	"api/internal/logger"
)

var CreateUserError = errors.New("Failed to create user")

type IdentityName struct {
	First string `json:"first" required:"true" example:"John"`
	Last  string `json:"last" required:"true" example:"Doe"`
}

type CreateUserRequest struct {
	Email    string       `json:"email" required:"true" format:"email" example:"user@example.com"`
	Password string       `json:"password" required:"true" minLength:"8" maxLength:"72" example:"securepassword123"`
	Name     IdentityName `json:"name" required:"true"`
}

type CreateUserInput struct {
	Body CreateUserRequest
}

type CreateUserOutput struct {
	Body *kratos.Identity
}

func (h *Handler) CreateUser(ctx context.Context, in *CreateUserInput) (*CreateUserOutput, error) {
	req := in.Body

	if _, err := mail.ParseAddress(req.Email); err != nil {
		return nil, huma.Error400BadRequest("Invalid email format")
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

	identity, resp, err := h.kratosAdmin.IdentityAPI.CreateIdentity(ctx).CreateIdentityBody(body).Execute()
	if err != nil {
		statusCode := 0
		if resp != nil {
			statusCode = resp.StatusCode
		}
		logger.Logger.Error("Failed to create identity", "error", err, "status", statusCode, "email", req.Email)

		if resp != nil {
			switch resp.StatusCode {
			case 409:
				return nil, huma.Error409Conflict("A user with this email already exists")
			case 400:
				return nil, huma.Error400BadRequest("Invalid user data provided")
			}
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateUserError, err).Error())
	}

	return &CreateUserOutput{Body: identity}, nil
}
