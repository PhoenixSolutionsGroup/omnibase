package handlers

import (
	"api/internal/logger"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v82"
)

type ErrorResponse struct {
	Error string `json:"error" example:"Invalid request parameters"`
}

func NewSuccessResponse(ctx *gin.Context, data any) {
	logger.Logger.Debug("Sending success response", "status", http.StatusOK, "path", ctx.Request.URL.Path)
	ctx.JSON(http.StatusOK, data)
}

func NewBadRequestResponse(ctx *gin.Context, message string) {
	logger.Logger.Info("Bad request", "status", http.StatusBadRequest, "path", ctx.Request.URL.Path, "error", message)
	ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: message})
}

func NewInternalServerErrorResponse(ctx *gin.Context, err error) {
	logger.Logger.Error("Internal server error", "status", http.StatusInternalServerError, "path", ctx.Request.URL.Path, "error", err)
	ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Internal Server Error"})
}

func NewNotFoundResponse(ctx *gin.Context, message string) {
	if message == "" {
		message = "Not Found"
	}
	logger.Logger.Warn("Not found", "status", http.StatusNotFound, "path", ctx.Request.URL.Path, "message", message)
	ctx.JSON(http.StatusNotFound, ErrorResponse{Error: message})
}

func NewUnauthorizedResponse(ctx *gin.Context, message string) {
	if message == "" {
		message = "Unauthorized"
	}
	logger.Logger.Warn("Unauthorized access", "status", http.StatusUnauthorized, "path", ctx.Request.URL.Path, "message", message)
	ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: message})
}

func NewForbiddenResponse(ctx *gin.Context, message string) {
	if message == "" {
		message = "Forbidden"
	}
	logger.Logger.Warn("Forbidden access", "status", http.StatusForbidden, "path", ctx.Request.URL.Path, "message", message)
	ctx.JSON(http.StatusForbidden, ErrorResponse{Error: message})
}

func NewNotAcceptableResponse(ctx *gin.Context, message string) {
	if message == "" {
		message = "Not Acceptable"
	}
	logger.Logger.Warn("Not acceptable", "status", http.StatusNotAcceptable, "path", ctx.Request.URL.Path, "message", message)
	ctx.JSON(http.StatusNotAcceptable, ErrorResponse{Error: message})
}

func NewMethodNotAllowedResponse(ctx *gin.Context, message string) {
	if message == "" {
		message = "Method Not Allowed"
	}
	logger.Logger.Warn("Method not allowed", "status", http.StatusMethodNotAllowed, "path", ctx.Request.URL.Path, "message", message)
	ctx.JSON(http.StatusMethodNotAllowed, ErrorResponse{Error: message})
}

func NewConflictResponse(ctx *gin.Context, message string) {
	if message == "" {
		message = "Conflict"
	}
	logger.Logger.Warn("Conflict", "status", http.StatusConflict, "path", ctx.Request.URL.Path, "message", message)
	ctx.JSON(http.StatusConflict, ErrorResponse{Error: message})
}

func NewTooManyRequestsResponse(ctx *gin.Context, message string) {
	if message == "" {
		message = "Too Many Requests"
	}
	logger.Logger.Warn("Rate limited", "status", http.StatusTooManyRequests, "path", ctx.Request.URL.Path, "message", message)
	ctx.JSON(http.StatusTooManyRequests, ErrorResponse{Error: message})
}

// HandleStripeError processes Stripe errors and returns appropriate HTTP responses.
// Returns true if the error was handled, false otherwise.
func HandleStripeError(ctx *gin.Context, err error) bool {
	var stripeErr *stripe.Error
	if !errors.As(err, &stripeErr) {
		return false
	}

	if stripeErr.HTTPStatusCode == 429 {
		NewTooManyRequestsResponse(ctx, stripeErr.Msg)
		return true
	}

	switch stripeErr.Type {
	case stripe.ErrorTypeInvalidRequest:
		if strings.HasPrefix(stripeErr.Msg, "No such") {
			NewNotFoundResponse(ctx, stripeErr.Msg)
			return true
		}
		NewBadRequestResponse(ctx, stripeErr.Msg)
		return true
	case stripe.ErrorTypeCard:
		NewBadRequestResponse(ctx, stripeErr.Msg)
		return true
	case stripe.ErrorTypeIdempotency:
		NewConflictResponse(ctx, stripeErr.Msg)
		return true
	case stripe.ErrorTypeAPI:
		return false
	default:
		NewBadRequestResponse(ctx, stripeErr.Msg)
		return true
	}
}
