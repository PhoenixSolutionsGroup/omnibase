package tenants

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"api/internal/database/repository"
	repomocks "api/internal/mocks/repository"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func newTenantHandlerWithRepo(repo repository.Querier) *TenantHandler {
	return &TenantHandler{repo: repo}
}

func TestGetTenantByID_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockRepo := repomocks.NewMockQuerier(t)
	h := newTenantHandlerWithRepo(mockRepo)

	now := time.Date(2026, 6, 23, 0, 0, 0, 0, time.UTC)
	stripeID := "cus_test"
	row := repository.GetTenantByIDRow{
		ID:               "7d5da463-8351-4abe-870c-8ccdefc4d78c",
		Name:             "Test Org",
		StripeCustomerID: &stripeID,
		Type:             "organization",
		CreatedAt:        now,
		UpdatedAt:        now,
	}
	mockRepo.EXPECT().GetTenantByID(mock.Anything, row.ID).Return(row, nil)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/api/v1/tenants/by-id/"+row.ID, nil)
	c.Params = gin.Params{{Key: "tenant_id", Value: row.ID}}

	h.GetTenantByID(c)

	require.Equal(t, http.StatusOK, w.Code)
	var got repository.GetTenantByIDRow
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &got))
	assert.Equal(t, row.ID, got.ID)
	assert.Equal(t, row.Name, got.Name)
	assert.Equal(t, row.StripeCustomerID, got.StripeCustomerID)
	assert.Equal(t, row.Type, got.Type)
}

func TestGetTenantByID_MissingParam(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockRepo := repomocks.NewMockQuerier(t)
	h := newTenantHandlerWithRepo(mockRepo)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/api/v1/tenants/by-id/", nil)

	h.GetTenantByID(c)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestGetTenantByID_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockRepo := repomocks.NewMockQuerier(t)
	h := newTenantHandlerWithRepo(mockRepo)

	id := "missing-id"
	mockRepo.EXPECT().GetTenantByID(mock.Anything, id).
		Return(repository.GetTenantByIDRow{}, pgx.ErrNoRows)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/api/v1/tenants/by-id/"+id, nil)
	c.Params = gin.Params{{Key: "tenant_id", Value: id}}

	h.GetTenantByID(c)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

func TestGetTenantByID_RepoError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockRepo := repomocks.NewMockQuerier(t)
	h := newTenantHandlerWithRepo(mockRepo)

	id := "abc"
	mockRepo.EXPECT().GetTenantByID(mock.Anything, id).
		Return(repository.GetTenantByIDRow{}, errors.New("db down"))

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/api/v1/tenants/by-id/"+id, nil)
	c.Params = gin.Params{{Key: "tenant_id", Value: id}}

	h.GetTenantByID(c)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}
