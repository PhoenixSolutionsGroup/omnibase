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

func TestGetTenantByStripeCustomerID_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockRepo := repomocks.NewMockQuerier(t)
	h := newTenantHandlerWithRepo(mockRepo)

	now := time.Date(2026, 6, 23, 0, 0, 0, 0, time.UTC)
	stripeID := "cus_test"
	row := repository.GetTenantByStripeCustomerIDRow{
		ID:               "7d5da463-8351-4abe-870c-8ccdefc4d78c",
		Name:             "Test Org",
		StripeCustomerID: &stripeID,
		Type:             "organization",
		CreatedAt:        now,
		UpdatedAt:        now,
	}
	mockRepo.EXPECT().GetTenantByStripeCustomerID(mock.Anything, &stripeID).Return(row, nil)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/api/v1/tenants/by-stripe-customer/"+stripeID, nil)
	c.Params = gin.Params{{Key: "stripe_customer_id", Value: stripeID}}

	h.GetTenantByStripeCustomerID(c)

	require.Equal(t, http.StatusOK, w.Code)
	var got repository.GetTenantByStripeCustomerIDRow
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &got))
	assert.Equal(t, row.ID, got.ID)
	assert.Equal(t, row.StripeCustomerID, got.StripeCustomerID)
}

func TestGetTenantByStripeCustomerID_MissingParam(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockRepo := repomocks.NewMockQuerier(t)
	h := newTenantHandlerWithRepo(mockRepo)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/api/v1/tenants/by-stripe-customer/", nil)

	h.GetTenantByStripeCustomerID(c)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestGetTenantByStripeCustomerID_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockRepo := repomocks.NewMockQuerier(t)
	h := newTenantHandlerWithRepo(mockRepo)

	stripeID := "cus_missing"
	mockRepo.EXPECT().GetTenantByStripeCustomerID(mock.Anything, &stripeID).
		Return(repository.GetTenantByStripeCustomerIDRow{}, pgx.ErrNoRows)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/api/v1/tenants/by-stripe-customer/"+stripeID, nil)
	c.Params = gin.Params{{Key: "stripe_customer_id", Value: stripeID}}

	h.GetTenantByStripeCustomerID(c)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

func TestGetTenantByStripeCustomerID_RepoError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockRepo := repomocks.NewMockQuerier(t)
	h := newTenantHandlerWithRepo(mockRepo)

	stripeID := "cus_err"
	mockRepo.EXPECT().GetTenantByStripeCustomerID(mock.Anything, &stripeID).
		Return(repository.GetTenantByStripeCustomerIDRow{}, errors.New("db down"))

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/api/v1/tenants/by-stripe-customer/"+stripeID, nil)
	c.Params = gin.Params{{Key: "stripe_customer_id", Value: stripeID}}

	h.GetTenantByStripeCustomerID(c)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}
