package helpers

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"sync/atomic"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

var seq atomic.Uint64

func UniqueID() string {
	n := seq.Add(1)
	return fmt.Sprintf("%d-%d", time.Now().UnixNano(), n)
}

func Ctx() context.Context { return context.Background() }

type ctxHeaderKey int

const (
	userIDHeaderKey ctxHeaderKey = iota
	tenantIDHeaderKey
	serviceKeyHeaderKey
)

func CtxWithUser(userID string) context.Context {
	return context.WithValue(context.Background(), userIDHeaderKey, userID)
}

func CtxWithTenant(tenantID string) context.Context {
	return context.WithValue(context.Background(), tenantIDHeaderKey, tenantID)
}

func CtxWithUserTenant(userID, tenantID string) context.Context {
	ctx := context.WithValue(context.Background(), userIDHeaderKey, userID)
	return context.WithValue(ctx, tenantIDHeaderKey, tenantID)
}

func CtxWithServiceKey(serviceKey string) context.Context {
	return context.WithValue(context.Background(), serviceKeyHeaderKey, serviceKey)
}

func CtxWithServiceKeyTenant(serviceKey, tenantID string) context.Context {
	ctx := context.WithValue(context.Background(), serviceKeyHeaderKey, serviceKey)
	return context.WithValue(ctx, tenantIDHeaderKey, tenantID)
}

func UserIDFromCtx(ctx context.Context) string {
	v, _ := ctx.Value(userIDHeaderKey).(string)
	return v
}

func TenantIDFromCtx(ctx context.Context) string {
	v, _ := ctx.Value(tenantIDHeaderKey).(string)
	return v
}

func ServiceKeyFromCtx(ctx context.Context) string {
	v, _ := ctx.Value(serviceKeyHeaderKey).(string)
	return v
}

func EnsureOK(t *testing.T, resp *http.Response, err error, op string) {
	t.Helper()
	if err == nil && resp != nil && resp.StatusCode == http.StatusOK {
		return
	}
	body := ""
	if resp != nil && resp.Body != nil {
		b, _ := io.ReadAll(resp.Body)
		body = string(b)
	}
	status := 0
	if resp != nil {
		status = resp.StatusCode
	}
	require.Failf(t, op+" failed", "status=%d err=%v body=%s", status, err, body)
}
