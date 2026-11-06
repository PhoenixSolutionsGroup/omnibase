package sessioncache

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

const Channel = "omnibase_session_cache"

const (
	keyPrefix  = "key:"
	userPrefix = "user:"
)

var NotifyError = errors.New("Failed to publish session cache invalidation")

type Invalidator struct {
	cache *Cache
	pool  *pgxpool.Pool
}

type InvalidatorDeps struct {
	Cache *Cache
	Pool  *pgxpool.Pool
}

func NewInvalidator(deps InvalidatorDeps) *Invalidator {
	return &Invalidator{cache: deps.Cache, pool: deps.Pool}
}

func (i *Invalidator) RevokeCredential(ctx context.Context, credential string) error {
	if i == nil || i.cache == nil {
		return nil
	}
	key := Key(credential)
	i.cache.EvictKey(key)
	return i.publish(ctx, keyPrefix+key)
}

func (i *Invalidator) RevokeUser(ctx context.Context, userID uuid.UUID) error {
	if i == nil || i.cache == nil {
		return nil
	}
	i.cache.EvictUser(userID)
	return i.publish(ctx, userPrefix+userID.String())
}

func (i *Invalidator) publish(ctx context.Context, payload string) error {
	if i.pool == nil {
		return nil
	}
	if _, err := i.pool.Exec(ctx, "SELECT pg_notify($1, $2)", Channel, payload); err != nil {
		return fmt.Errorf("%w: %w", NotifyError, err)
	}
	return nil
}

func (c *Cache) apply(payload string) {
	switch {
	case strings.HasPrefix(payload, keyPrefix):
		c.EvictKey(strings.TrimPrefix(payload, keyPrefix))
	case strings.HasPrefix(payload, userPrefix):
		if id, err := uuid.Parse(strings.TrimPrefix(payload, userPrefix)); err == nil {
			c.EvictUser(id)
		}
	}
}
