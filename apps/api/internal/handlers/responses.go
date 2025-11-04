package handlers

import (
	"api/internal/logger"
	"net/http"

	"github.com/gin-gonic/gin"
)

type SuccessResponse struct {
	Status int `json:"status"`
	Data   any `json:"data,omitempty"`
}

func NewSuccessResponse(ctx *gin.Context, data any) {
	logger.Logger.Debug("Sending success response", "status", http.StatusOK, "path", ctx.Request.URL.Path)
	ctx.JSON(http.StatusOK, SuccessResponse{
		Status: http.StatusOK,
		Data:   data,
	})
}

type BadRequestResponse struct {
	Status int `json:"status"`
	Error  any `json:"error"`
}

func NewBadRequestResponse(ctx *gin.Context, message any) {
	logger.Logger.Warn("Bad request", "status", http.StatusBadRequest, "path", ctx.Request.URL.Path, "error", message)
	ctx.JSON(http.StatusBadRequest, BadRequestResponse{
		Status: http.StatusBadRequest,
		Error:  message,
	})
}

type InternalServerErrorResponse struct {
	Status int    `json:"status"`
	Error  string `json:"error"`
}

func NewInternalServerErrorResponse(ctx *gin.Context, err error) {
	logger.Logger.Error("Internal server error", "status", http.StatusInternalServerError, "path", ctx.Request.URL.Path, "error", err)
	ctx.JSON(http.StatusInternalServerError, InternalServerErrorResponse{
		Status: http.StatusInternalServerError,
		Error:  "Internal Server Error",
	})
}

type NotFoundErrorResponse struct {
	Status int    `json:"status"`
	Error  string `json:"error"`
}

func NewNotFoundErrorResponse(ctx *gin.Context) {
	logger.Logger.Warn("Resource not found", "status", http.StatusNotFound, "path", ctx.Request.URL.Path)
	ctx.JSON(http.StatusNotFound, InternalServerErrorResponse{
		Status: http.StatusNotFound,
		Error:  "Not Found",
	})
}

type UnauthorizedResponse struct {
	Status int    `json:"status"`
	Error  string `json:"error"`
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

type ForbiddenResponse struct {
	Status int    `json:"status"`
	Error  string `json:"error"`
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
