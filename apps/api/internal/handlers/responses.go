package handlers

import (
	"api/internal/logger"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v82"
)

// SuccessResponse represents a successful API response
type SuccessResponse struct {
	// HTTP status code
	Status int `json:"status" example:"200"`
	// Response data payload
	Data any `json:"data,omitempty"`
}

func NewSuccessResponse(ctx *gin.Context, data any) {
	logger.Logger.Debug("Sending success response", "status", http.StatusOK, "path", ctx.Request.URL.Path)
	ctx.JSON(http.StatusOK, SuccessResponse{
		Status: http.StatusOK,
		Data:   data,
	})
}

// BadRequestResponse represents a 400 Bad Request error response
type BadRequestResponse struct {
	// HTTP status code
	Status int `json:"status" example:"400"`
	// Error message or details
	Error string `json:"error" example:"Invalid request parameters"`
}

func NewBadRequestResponse(ctx *gin.Context, message string) {
	logger.Logger.Warn("Bad request", "status", http.StatusBadRequest, "path", ctx.Request.URL.Path, "error", message)

	ctx.JSON(http.StatusBadRequest, BadRequestResponse{
		Status: http.StatusBadRequest,
		Error:  message,
	})
}

// InternalServerErrorResponse represents a 500 Internal Server Error response
type InternalServerErrorResponse struct {
	// HTTP status code
	Status int `json:"status" example:"500"`
	// Error message
	Error string `json:"error" example:"Internal Server Error"`
}

func NewInternalServerErrorResponse(ctx *gin.Context, err error) {
	logger.Logger.Error("Internal server error", "status", http.StatusInternalServerError, "path", ctx.Request.URL.Path, "error", err)
	ctx.JSON(http.StatusInternalServerError, InternalServerErrorResponse{
		Status: http.StatusInternalServerError,
		Error:  "Internal Server Error",
	})
}

// NotFoundErrorResponse represents a 404 Not Found error response
type NotFoundErrorResponse struct {
	// HTTP status code
	Status int `json:"status" example:"404"`
	// Error message
	Error string `json:"error" example:"Not Found"`
}

func NewNotFoundErrorResponse(ctx *gin.Context) {
	logger.Logger.Warn("Resource not found", "status", http.StatusNotFound, "path", ctx.Request.URL.Path)
	ctx.JSON(http.StatusNotFound, InternalServerErrorResponse{
		Status: http.StatusNotFound,
		Error:  "Not Found",
	})
}

// UnauthorizedResponse represents a 401 Unauthorized error response
type UnauthorizedResponse struct {
	// HTTP status code
	Status int `json:"status" example:"401"`
	// Error message
	Error string `json:"error" example:"Unauthorized"`
}

func NewUnauthorizedResponse(ctx *gin.Context, message string) {
	if message == "" {
		message = "Unauthorized"
	}
	logger.Logger.Warn("Unauthorized access", "status", http.StatusUnauthorized, "path", ctx.Request.URL.Path, "message", message)
	ctx.JSON(http.StatusUnauthorized, UnauthorizedResponse{
		Status: http.StatusUnauthorized,
		Error:  message,
	})
}

// ForbiddenResponse represents a 403 Forbidden error response
type ForbiddenResponse struct {
	// HTTP status code
	Status int `json:"status" example:"403"`
	// Error message
	Error string `json:"error" example:"Forbidden"`
}

func NewForbiddenResponse(ctx *gin.Context, message string) {
	if message == "" {
		message = "Forbidden"
	}
	logger.Logger.Warn("Forbidden access", "status", http.StatusForbidden, "path", ctx.Request.URL.Path, "message", message)
	ctx.JSON(http.StatusForbidden, ForbiddenResponse{
		Status: http.StatusForbidden,
		Error:  message,
	})
}

func NewNotFoundResponse(ctx *gin.Context, message string) {
	if message == "" {
		message = "Not Found"
	}
	logger.Logger.Warn("Not found", "status", http.StatusNotFound, "path", ctx.Request.URL.Path, "message", message)
	ctx.JSON(http.StatusNotFound, NotFoundErrorResponse{
		Status: http.StatusNotFound,
		Error:  message,
	})
}

// NotAcceptableResponse represents a 406 Not Acceptable error response
type NotAcceptableResponse struct {
	// HTTP status code
	Status int `json:"status" example:"406"`
	// Error message
	Error string `json:"error" example:"Not Acceptable"`
}

func NewNotAcceptableResponse(ctx *gin.Context, message string) {
	if message == "" {
		message = "Not Acceptable"
	}
	logger.Logger.Warn("Not acceptable", "status", http.StatusNotAcceptable, "path", ctx.Request.URL.Path, "message", message)
	ctx.JSON(http.StatusNotAcceptable, NotAcceptableResponse{
		Status: http.StatusNotAcceptable,
		Error:  message,
	})
}

// MethodNotAllowedResponse represents a 405 Method Not Allowed error response
type MethodNotAllowedResponse struct {
	// HTTP status code
	Status int `json:"status" example:"405"`
	// Error message
	Error string `json:"error" example:"Method Not Allowed"`
}

func NewMethodNotAllowedResponse(ctx *gin.Context, message string) {
	if message == "" {
		message = "Method Not Allowed"
	}
	logger.Logger.Warn("Method not allowed", "status", http.StatusMethodNotAllowed, "path", ctx.Request.URL.Path, "message", message)
	ctx.JSON(http.StatusMethodNotAllowed, MethodNotAllowedResponse{
		Status: http.StatusMethodNotAllowed,
		Error:  message,
	})
}

// ConflictResponse represents a 409 Conflict error response
type ConflictResponse struct {
	// HTTP status code
	Status int `json:"status" example:"409"`
	// Error message
	Error string `json:"error" example:"Conflict"`
}

func NewConflictResponse(ctx *gin.Context, message string) {
	if message == "" {
		message = "Conflict"
	}
	logger.Logger.Warn("Conflict", "status", http.StatusConflict, "path", ctx.Request.URL.Path, "message", message)
	ctx.JSON(http.StatusConflict, ConflictResponse{
		Status: http.StatusConflict,
		Error:  message,
	})
}

// TooManyRequestsResponse represents a 429 Too Many Requests error response
type TooManyRequestsResponse struct {
	// HTTP status code
	Status int `json:"status" example:"429"`
	// Error message
	Error string `json:"error" example:"Too Many Requests"`
}

func NewTooManyRequestsResponse(ctx *gin.Context, message string) {
	if message == "" {
		message = "Too Many Requests"
	}
	logger.Logger.Warn("Rate limited", "status", http.StatusTooManyRequests, "path", ctx.Request.URL.Path, "message", message)
	ctx.JSON(http.StatusTooManyRequests, TooManyRequestsResponse{
		Status: http.StatusTooManyRequests,
		Error:  message,
	})
}

// HandleStripeError processes Stripe errors and returns appropriate HTTP responses.
// Returns true if the error was handled, false otherwise.
func HandleStripeError(ctx *gin.Context, err error) bool {
	var stripeErr *stripe.Error
	if !errors.As(err, &stripeErr) {
		return false
	}

	// Check for rate limit errors first (HTTP 429)
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
		// API errors are server-side Stripe issues, not client errors
		return false
	default:
		// For any other Stripe error types, treat as bad request
		NewBadRequestResponse(ctx, stripeErr.Msg)
		return true
	}
}
