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
