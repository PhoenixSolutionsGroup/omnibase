package sessioncache

import (
	"crypto/sha256"
	"encoding/hex"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/hashicorp/golang-lru/v2/expirable"
	kratos "github.com/ory/kratos-client-go"
)

type Entry struct {
	UserID    uuid.UUID
	Session   *kratos.Session
	ExpiresAt time.Time
}

type Cache struct {
	lru    *expirable.LRU[string, Entry]
	mu     sync.Mutex
	byUser map[uuid.UUID]map[string]struct{}
	now    func() time.Time
}

type Deps struct {
	TTL        time.Duration
	MaxEntries int
}

func New(deps Deps) *Cache {
	if deps.TTL <= 0 || deps.MaxEntries <= 0 {
		return nil
	}
	c := &Cache{
		byUser: make(map[uuid.UUID]map[string]struct{}),
		now:    time.Now,
	}
	c.lru = expirable.NewLRU(deps.MaxEntries, c.onEvict, deps.TTL)
	return c
}

func Key(credential string) string {
	sum := sha256.Sum256([]byte(credential))
	return hex.EncodeToString(sum[:])
}

func (c *Cache) Get(key string) (Entry, bool) {
	if c == nil {
		return Entry{}, false
	}
	e, ok := c.lru.Get(key)
	if !ok {
		return Entry{}, false
	}
	if !e.ExpiresAt.IsZero() && !c.now().Before(e.ExpiresAt) {
		c.lru.Remove(key)
		return Entry{}, false
	}
	return e, true
}

func (c *Cache) Set(key string, e Entry) {
	if c == nil {
		return
	}
	c.mu.Lock()
	keys, ok := c.byUser[e.UserID]
	if !ok {
		keys = make(map[string]struct{})
		c.byUser[e.UserID] = keys
	}
	keys[key] = struct{}{}
	c.mu.Unlock()
	c.lru.Add(key, e)
}

func (c *Cache) EvictKey(key string) {
	if c == nil {
		return
	}
	c.lru.Remove(key)
}

func (c *Cache) EvictUser(userID uuid.UUID) {
	if c == nil {
		return
	}
	c.mu.Lock()
	keys := make([]string, 0, len(c.byUser[userID]))
	for k := range c.byUser[userID] {
		keys = append(keys, k)
	}
	c.mu.Unlock()
	for _, k := range keys {
		c.lru.Remove(k)
	}
}

func (c *Cache) Purge() {
	if c == nil {
		return
	}
	c.lru.Purge()
}

func (c *Cache) Len() int {
	if c == nil {
		return 0
	}
	return c.lru.Len()
}

func (c *Cache) onEvict(key string, e Entry) {
	c.mu.Lock()
	defer c.mu.Unlock()
	keys := c.byUser[e.UserID]
	delete(keys, key)
	if len(keys) == 0 {
		delete(c.byUser, e.UserID)
	}
}
