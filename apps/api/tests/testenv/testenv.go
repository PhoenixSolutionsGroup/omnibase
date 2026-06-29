package testenv

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/compose"
	"github.com/testcontainers/testcontainers-go/wait"
)

const stackName = "ob-api-test-deps"

type Env struct {
	PostgresHost  string
	PostgresPort  string
	PostgresDSN   string
	PgbouncerHost string
	PgbouncerPort string
	PgbouncerDSN  string
	KratosPublic  string
	KratosAdmin   string
	KetoRead      string
	KetoWrite     string
	StripeMockURL string
	MailpitSMTP   string
	MailpitWeb    string
	RustFSURL     string

	stack compose.ComposeStack
}

func Start(t *testing.T) *Env {
	t.Helper()
	ctx := context.Background()

	overall := time.Now()
	phase := func(label string, start time.Time) {
		t.Logf("[testenv timing] %s: %s", label, time.Since(start).Round(time.Millisecond))
	}

	if os.Getenv("TESTCONTAINERS_RYUK_DISABLED") == "" {
		os.Setenv("TESTCONTAINERS_RYUK_DISABLED", "true")
	}

	_, thisFile, _, _ := runtime.Caller(0)
	composePath := filepath.Join(filepath.Dir(thisFile), "docker-compose.test-deps.yml")

	t0 := time.Now()
	stack, err := compose.NewDockerComposeWith(
		compose.WithStackFiles(composePath),
		compose.StackIdentifier(stackName),
	)
	require.NoError(t, err)
	phase("NewDockerComposeWith", t0)

	t0 = time.Now()
	alreadyUp := stackAlreadyUp()
	phase("stackAlreadyUp check", t0)

	if alreadyUp {
		t.Log("[testenv] reattaching to existing stack (skip compose up)")
	} else {
		if hasStaleContainers() {
			t.Log("[testenv] removing stale (stopped) containers from prior run")
			downCtx, downCancel := context.WithTimeout(ctx, 1*time.Minute)
			_ = stack.Down(downCtx, compose.RemoveOrphans(true), compose.RemoveVolumes(true))
			downCancel()
		}

		upCtx, cancel := context.WithTimeout(ctx, 5*time.Minute)
		defer cancel()

		t0 = time.Now()
		err = stack.
			WaitForService("postgres", wait.ForHealthCheck()).
			WaitForService("pgbouncer", wait.ForHealthCheck()).
			WaitForService("auth", wait.ForListeningPort("4434/tcp")).
			WaitForService("permissions", wait.ForListeningPort("4466/tcp")).
			WaitForService("stripe-mock", wait.ForListeningPort("12111/tcp")).
			WaitForService("mailpit", wait.ForListeningPort("8025/tcp")).
			Up(upCtx)
		phase("compose Up + WaitForService", t0)
		if err != nil {
			dumpAllLogs(t, ctx, stack)
			_ = stack.Down(context.Background(), compose.RemoveOrphans(true), compose.RemoveVolumes(true))
			require.NoError(t, err)
		}
	}

	env := &Env{stack: stack}

	t0 = time.Now()
	env.PostgresHost, env.PostgresPort = endpoint(t, ctx, stack, "postgres", "5432/tcp")
	env.PostgresDSN = fmt.Sprintf("postgres://postgres:postgres@%s:%s/db?sslmode=disable",
		env.PostgresHost, env.PostgresPort)
	phase("endpoint postgres", t0)

	t0 = time.Now()
	env.PgbouncerHost, env.PgbouncerPort = endpoint(t, ctx, stack, "pgbouncer", "6432/tcp")
	env.PgbouncerDSN = fmt.Sprintf("postgres://postgres:postgres@%s:%s/db?sslmode=disable",
		env.PgbouncerHost, env.PgbouncerPort)
	phase("endpoint pgbouncer", t0)

	t0 = time.Now()
	env.KratosPublic = httpURL(t, ctx, stack, "auth", "4433/tcp")
	env.KratosAdmin = httpURL(t, ctx, stack, "auth", "4434/tcp")
	phase("endpoint auth x2", t0)

	t0 = time.Now()
	env.KetoRead = httpURL(t, ctx, stack, "permissions", "4466/tcp")
	env.KetoWrite = httpURL(t, ctx, stack, "permissions", "4467/tcp")
	phase("endpoint permissions x2", t0)

	t0 = time.Now()
	env.StripeMockURL = httpURL(t, ctx, stack, "stripe-mock", "12111/tcp")
	phase("endpoint stripe-mock", t0)

	t0 = time.Now()
	smtpHost, smtpPort := endpoint(t, ctx, stack, "mailpit", "1025/tcp")
	env.MailpitSMTP = fmt.Sprintf("%s:%s", smtpHost, smtpPort)
	env.MailpitWeb = httpURL(t, ctx, stack, "mailpit", "8025/tcp")
	phase("endpoint mailpit x2", t0)

	t0 = time.Now()
	env.RustFSURL = httpURL(t, ctx, stack, "rustfs", "9000/tcp")
	phase("endpoint rustfs", t0)

	phase("TOTAL testenv.Start", overall)

	t.Cleanup(func() {
		if os.Getenv("KEEP_STACK") == "1" {
			t.Log("KEEP_STACK=1 — leaving containers running; run `make integration-down` to teardown")
			return
		}
		downCtx, downCancel := context.WithTimeout(context.Background(), 2*time.Minute)
		defer downCancel()
		_ = stack.Down(downCtx, compose.RemoveOrphans(true), compose.RemoveVolumes(true))
	})

	return env
}

func endpoint(t *testing.T, ctx context.Context, s compose.ComposeStack, svc, port string) (host, hostPort string) {
	t.Helper()
	c := serviceContainer(t, ctx, s, svc)
	h, err := c.Host(ctx)
	require.NoError(t, err)
	p, err := c.MappedPort(ctx, port)
	require.NoError(t, err)
	return h, p.Port()
}

func httpURL(t *testing.T, ctx context.Context, s compose.ComposeStack, svc, port string) string {
	t.Helper()
	host, hostPort := endpoint(t, ctx, s, svc, port)
	return fmt.Sprintf("http://%s:%s", host, hostPort)
}

func serviceContainer(t *testing.T, ctx context.Context, s compose.ComposeStack, svc string) testcontainers.Container {
	t.Helper()
	c, err := s.ServiceContainer(ctx, svc)
	require.NoError(t, err)
	return c
}

func stackAlreadyUp() bool {
	out, err := exec.Command("docker", "ps",
		"--filter", "label=com.docker.compose.project="+stackName,
		"--filter", "status=running",
		"--quiet").Output()
	if err != nil {
		return false
	}
	return strings.TrimSpace(string(out)) != ""
}

func hasStaleContainers() bool {
	out, err := exec.Command("docker", "ps", "-a",
		"--filter", "label=com.docker.compose.project="+stackName,
		"--quiet").Output()
	if err != nil {
		return false
	}
	return strings.TrimSpace(string(out)) != ""
}

func dumpAllLogs(t *testing.T, ctx context.Context, s compose.ComposeStack) {
	t.Helper()
	defer func() {
		if r := recover(); r != nil {
			t.Logf("dumpAllLogs panicked (compose stack not fully initialized): %v", r)
		}
	}()
	if s == nil {
		t.Log("dumpAllLogs: nil compose stack")
		return
	}
	svcs := s.Services()
	if len(svcs) == 0 {
		t.Log("dumpAllLogs: no services on stack (compose Up likely failed before project parse)")
		return
	}
	for _, svc := range svcs {
		c, err := s.ServiceContainer(ctx, svc)
		if err != nil {
			t.Logf("[%s] service container missing: %v", svc, err)
			continue
		}
		rc, err := c.Logs(ctx)
		if err != nil {
			t.Logf("[%s] logs error: %v", svc, err)
			continue
		}
		b, _ := io.ReadAll(rc)
		_ = rc.Close()
		t.Logf("===== logs: %s =====\n%s", svc, string(b))
	}
}
