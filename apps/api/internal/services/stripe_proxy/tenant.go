package stripe_proxy

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

var ErrTenantNotFound = errors.New("tenant not found")

type Tenant struct {
	Name       string
	CustomerID string
}

type TenantStore interface {
	Get(ctx context.Context, tenantID uuid.UUID) (Tenant, error)
	SetCustomer(ctx context.Context, tenantID uuid.UUID, customerID string) error
}

type gormTenantStore struct {
	db *gorm.DB
}

func NewTenantStore(db *gorm.DB) TenantStore {
	return &gormTenantStore{db: db}
}

func (s *gormTenantStore) Get(ctx context.Context, tenantID uuid.UUID) (Tenant, error) {
	if s.db == nil {
		return Tenant{}, fmt.Errorf("%w: tenant store is not configured", ErrTenantNotFound)
	}

	var row struct {
		Name             string
		StripeCustomerID *string
	}
	err := s.db.WithContext(ctx).
		Table("auth.tenants").
		Select("name, stripe_customer_id").
		Where("id = ?", tenantID).
		Take(&row).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return Tenant{}, ErrTenantNotFound
		}
		return Tenant{}, err
	}

	tenant := Tenant{Name: row.Name}
	if row.StripeCustomerID != nil {
		tenant.CustomerID = *row.StripeCustomerID
	}
	return tenant, nil
}

func (s *gormTenantStore) SetCustomer(ctx context.Context, tenantID uuid.UUID, customerID string) error {
	if s.db == nil {
		return errors.New("tenant store is not configured")
	}
	return s.db.WithContext(ctx).
		Table("auth.tenants").
		Where("id = ? AND (stripe_customer_id IS NULL OR stripe_customer_id = '')", tenantID).
		Update("stripe_customer_id", customerID).Error
}
