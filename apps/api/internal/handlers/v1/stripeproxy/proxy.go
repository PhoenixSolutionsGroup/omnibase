package stripeproxy

import (
	"errors"
	"io"
	"mime"
	"net/http"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"api/internal/authn"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/stripe_proxy"
)

const maxProxyBodyBytes = 10 << 20

var errBodyTooLarge = errors.New("request body too large")

type Handler struct {
	service *stripe_proxy.Service
}

func New(service *stripe_proxy.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Proxy(c *gin.Context) {
	path := c.Param("path")
	if path == "" {
		path = "/"
	}
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}

	form, body, isForm, err := readForm(c.Request)
	if err != nil {
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	tenantID := uuid.Nil
	if principal, ok := authn.Get(c); ok {
		tenantID = principal.TenantID
	}

	resolveIDs := !strings.EqualFold(strings.TrimSpace(c.GetHeader("Omnibase-Resolve-Ids")), "false")

	resp, err := h.service.Forward(c.Request.Context(), stripe_proxy.Request{
		Method:     c.Request.Method,
		Path:       path,
		Header:     c.Request.Header,
		Query:      c.Request.URL.Query(),
		Form:       form,
		Body:       body,
		IsForm:     isForm,
		TenantID:   tenantID,
		ResolveIDs: resolveIDs,
	})
	if err != nil {
		writeServiceError(c, err)
		return
	}
	defer resp.Body.Close()

	for key, values := range resp.Header {
		if !forwardResponseHeader(key) {
			continue
		}
		for _, value := range values {
			c.Writer.Header().Add(key, value)
		}
	}

	c.Status(resp.StatusCode)
	if _, err := io.Copy(c.Writer, resp.Body); err != nil {
		logger.Logger.Error("stripe_proxy.copy_response_failed", "error", err, "path", path)
	}
}

func readForm(req *http.Request) (url.Values, []byte, bool, error) {
	if req.Body == nil {
		return url.Values{}, nil, false, nil
	}

	body, err := io.ReadAll(io.LimitReader(req.Body, maxProxyBodyBytes+1))
	if err != nil {
		return nil, nil, false, err
	}
	if len(body) > maxProxyBodyBytes {
		return nil, nil, false, errBodyTooLarge
	}

	mediaType, _, _ := mime.ParseMediaType(req.Header.Get("Content-Type"))
	if mediaType != "application/x-www-form-urlencoded" {
		return url.Values{}, body, false, nil
	}

	form, err := url.ParseQuery(string(body))
	if err != nil {
		return nil, nil, true, err
	}
	return form, body, true, nil
}

func writeServiceError(c *gin.Context, err error) {
	var serviceErr *stripe_proxy.Error
	if !errors.As(err, &serviceErr) {
		logger.Logger.Error("stripe_proxy.request_failed", "error", err, "path", c.Request.URL.Path)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	switch serviceErr.Status {
	case http.StatusBadRequest:
		handlers.NewBadRequestResponse(c, serviceErr.Message)
	case http.StatusForbidden:
		handlers.NewForbiddenResponse(c, serviceErr.Message)
	case http.StatusNotFound:
		handlers.NewNotFoundResponse(c, serviceErr.Message)
	case http.StatusUnprocessableEntity:
		handlers.NewUnprocessableEntityResponse(c, serviceErr.Message)
	default:
		logger.Logger.Error("stripe_proxy.request_failed",
			"status", serviceErr.Status,
			"message", serviceErr.Message,
			"error", serviceErr.Err,
			"path", c.Request.URL.Path)
		handlers.NewInternalServerErrorResponse(c, serviceErr.Err)
	}
}

func forwardResponseHeader(key string) bool {
	switch strings.ToLower(key) {
	case "connection",
		"keep-alive",
		"proxy-authenticate",
		"proxy-authorization",
		"te",
		"trailer",
		"transfer-encoding",
		"upgrade":
		return false
	}
	return true
}
