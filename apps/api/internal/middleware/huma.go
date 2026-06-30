package middleware

import (
	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humagin"
	"github.com/gin-gonic/gin"
)

func GinToHuma(handlers ...gin.HandlerFunc) func(huma.Context, func(huma.Context)) {
	return func(ctx huma.Context, next func(huma.Context)) {
		gc := humagin.Unwrap(ctx)
		for _, h := range handlers {
			h(gc)
			if gc.IsAborted() {
				return
			}
		}
		next(ctx)
	}
}
