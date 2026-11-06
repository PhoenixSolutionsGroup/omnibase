package sessioncache

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newTestCache(t *testing.T, ttl time.Duration) *Cache {
	t.Helper()
	c := New(Deps{TTL: ttl, MaxEntries: 100})
	require.NotNil(t, c)
	return c
}

func TestNew_DisabledWhenTTLZero(t *testing.T) {
	c := New(Deps{TTL: 0, MaxEntries: 100})
	assert.Nil(t, c)

	c.Set("k", Entry{UserID: uuid.New()})
	_, ok := c.Get("k")
	assert.False(t, ok)
	c.EvictUser(uuid.New())
	c.Purge()
}

func TestCache_SetGet(t *testing.T) {
	c := newTestCache(t, time.Minute)
	user := uuid.New()

	c.Set("k", Entry{UserID: user})
	got, ok := c.Get("k")
	require.True(t, ok)
	assert.Equal(t, user, got.UserID)
}

func TestCache_TTLExpiry(t *testing.T) {
	c := newTestCache(t, 50*time.Millisecond)
	c.Set("k", Entry{UserID: uuid.New()})

	assert.Eventually(t, func() bool {
		_, ok := c.Get("k")
		return !ok
	}, time.Second, 10*time.Millisecond)
}

func TestCache_SessionExpiryBeatsTTL(t *testing.T) {
	c := newTestCache(t, time.Hour)
	now := time.Now()
	c.now = func() time.Time { return now }

	c.Set("k", Entry{UserID: uuid.New(), ExpiresAt: now.Add(time.Second)})
	_, ok := c.Get("k")
	assert.True(t, ok)

	now = now.Add(2 * time.Second)
	_, ok = c.Get("k")
	assert.False(t, ok)
}

func TestCache_EvictUser(t *testing.T) {
	c := newTestCache(t, time.Minute)
	alice, bob := uuid.New(), uuid.New()

	c.Set("a1", Entry{UserID: alice})
	c.Set("a2", Entry{UserID: alice})
	c.Set("b1", Entry{UserID: bob})

	c.EvictUser(alice)

	_, ok := c.Get("a1")
	assert.False(t, ok)
	_, ok = c.Get("a2")
	assert.False(t, ok)
	_, ok = c.Get("b1")
	assert.True(t, ok)
	assert.NotContains(t, c.byUser, alice)
}

func TestCache_ApplyNotification(t *testing.T) {
	c := newTestCache(t, time.Minute)
	alice, bob := uuid.New(), uuid.New()
	c.Set(Key("token:a"), Entry{UserID: alice})
	c.Set("b1", Entry{UserID: bob})

	c.apply(keyPrefix + Key("token:a"))
	_, ok := c.Get(Key("token:a"))
	assert.False(t, ok)

	c.apply(userPrefix + bob.String())
	_, ok = c.Get("b1")
	assert.False(t, ok)

	c.apply("garbage")
}

func TestCache_CapacityEvictionCleansIndex(t *testing.T) {
	c := New(Deps{TTL: time.Minute, MaxEntries: 1})
	alice, bob := uuid.New(), uuid.New()

	c.Set("a", Entry{UserID: alice})
	c.Set("b", Entry{UserID: bob})

	_, ok := c.Get("a")
	assert.False(t, ok)
	assert.NotContains(t, c.byUser, alice)
}
