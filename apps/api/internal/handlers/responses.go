package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type SuccessResponse struct {
	Status int `json:"status"`
	Data   any `json:"data,omitempty"`
}

func NewSuccessResponse(ctx *gin.Context, data any) {
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
	fmt.Print(err)
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
	ctx.JSON(http.StatusForbidden, ForbiddenResponse{
		Status: http.StatusForbidden,
		Error:  message,
	})
}

func NewNotFoundResponse(ctx *gin.Context, message string) {
	if message == "" {
		message = "Not Found"
	}
	ctx.JSON(http.StatusNotFound, NotFoundErrorResponse{
		Status: http.StatusNotFound,
		Error:  message,
	})
}
