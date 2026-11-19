package v1

import (
	"github.com/gin-gonic/gin"

	"api/internal/authn"
	"api/internal/handlers/v1/rest"
)

func SetUpRestRoutes(router *gin.RouterGroup, d Deps) {
	handler := rest.New(rest.Deps{
		PostgRESTURL: d.Cfg.PostgRESTURL,
		SigningKey:   d.Cfg.Database.SigningKey,
	})
	auth := d.Auth.OptionalAuth(authn.AuthSessionOrBackendKey)
	router.Any("", auth, handler.Proxy)
	router.Any("/*path", auth, handler.Proxy)
}
