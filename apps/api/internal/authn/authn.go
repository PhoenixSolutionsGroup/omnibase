package authn

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	kratos "github.com/ory/kratos-client-go"
)

type AuthMethod uint8

const AuthNone AuthMethod = 0

const (
	AuthSession AuthMethod = 1 << iota
	AuthServiceKey
	AuthAppKey

	AuthSessionOrBackendKey = AuthSession | AuthServiceKey | AuthAppKey
)

type Principal struct {
	Method   AuthMethod
	UserID   uuid.UUID
	TenantID uuid.UUID
	Session  *kratos.Session
	Identity *kratos.Identity
}

const principalKey = "omnibase_principal"

func Set(c *gin.Context, p *Principal) {
	c.Set(principalKey, p)
}

func Get(c *gin.Context) (*Principal, bool) {
	value, exists := c.Get(principalKey)
	if !exists {
		return nil, false
	}
	p, ok := value.(*Principal)
	return p, ok
}
