package db_test

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

var (
	sharedOnce sync.Once
	sharedCtr  testcontainers.Container
	sharedURL  string
	sharedErr  error

	baseMu  sync.Mutex
	baseDBs = map[string]string{}
)

func TestMain(m *testing.M) {
	code := m.Run()
	if sharedCtr != nil {
		_ = sharedCtr.Terminate(context.Background())
	}
	os.Exit(code)
}

func sharedPostgres(t *testing.T) string {
	t.Helper()
	sharedOnce.Do(func() {
		sharedCtr, sharedURL, sharedErr = startPostgresContainer()
	})
	require.NoError(t, sharedErr)
	return sharedURL
}

func startPostgresContainer() (testcontainers.Container, string, error) {
	if os.Getenv("TESTCONTAINERS_RYUK_DISABLED") == "" {
		os.Setenv("TESTCONTAINERS_RYUK_DISABLED", "true")
	}
	ctx := context.Background()
	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: testcontainers.ContainerRequest{
			Image:        "postgres:17-alpine",
			ExposedPorts: []string{"5432/tcp"},
			Env: map[string]string{
				"POSTGRES_DB":       "db",
				"POSTGRES_USER":     "postgres",
				"POSTGRES_PASSWORD": "postgres",
			},
			WaitingFor: wait.ForLog("database system is ready to accept connections").
				WithStartupTimeout(2 * time.Minute),
		},
		Started: true,
	})
	if err != nil {
		return nil, "", err
	}
	host, err := container.Host(ctx)
	if err != nil {
		return container, "", err
	}
	port, err := container.MappedPort(ctx, "5432/tcp")
	if err != nil {
		return container, "", err
	}
	return container, fmt.Sprintf("postgres://postgres:postgres@%s:%s", host, port.Port()), nil
}

func connect(t *testing.T, dsn string) *pgx.Conn {
	t.Helper()
	ctx := context.Background()
	var conn *pgx.Conn
	var err error
	require.Eventually(t, func() bool {
		conn, err = pgx.Connect(ctx, dsn)
		return err == nil
	}, 30*time.Second, 500*time.Millisecond)
	t.Cleanup(func() { _ = conn.Close(context.Background()) })
	return conn
}

func execSQL(t *testing.T, conn *pgx.Conn, sql string) {
	t.Helper()
	_, err := conn.Exec(context.Background(), sql)
	require.NoError(t, err)
}

func applyMigrationsThrough(t *testing.T, conn *pgx.Conn, through string) {
	t.Helper()
	_, thisFile, _, _ := runtime.Caller(0)
	dir := filepath.Join(filepath.Dir(thisFile), "..", "..", "..", "..", "..",
		"packages", "cli", "docker", "db")
	entries, err := os.ReadDir(dir)
	require.NoError(t, err)

	var files []string
	for _, entry := range entries {
		if strings.HasSuffix(entry.Name(), ".up.sql") {
			files = append(files, entry.Name())
		}
	}
	sort.Strings(files)

	for _, name := range files {
		if name[:len(through)] > through {
			break
		}
		body, err := os.ReadFile(filepath.Join(dir, name))
		require.NoError(t, err, name)
		execSQL(t, conn, string(body))
	}
}

func scopedDB(t *testing.T, admin *pgx.Conn, through string) *pgx.Conn {
	t.Helper()
	baseMu.Lock()
	defer baseMu.Unlock()

	name, ok := baseDBs[through]
	if !ok {
		name = "base_" + through
		execSQL(t, admin, "CREATE DATABASE "+pgx.Identifier{name}.Sanitize())
		conn := connect(t, sharedURL+"/"+name+"?sslmode=disable")
		applyMigrationsThrough(t, conn, through)
		execSQL(t, conn, scopeFixtures)
		_ = conn.Close(context.Background())
		baseDBs[through] = name
	}
	return connect(t, sharedURL+"/"+name+"?sslmode=disable")
}

const scopeFixtures = `
CREATE TABLE permissions.keto_relation_tuples (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace text NOT NULL,
    object uuid NOT NULL,
    relation text NOT NULL,
    subject_id uuid,
    subject_set_namespace text,
    subject_set_object uuid
);

CREATE TABLE permissions.keto_uuid_mappings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    string_representation text UNIQUE NOT NULL
);

CREATE TABLE auth.identities (
    id text PRIMARY KEY,
    secret text NOT NULL
);

CREATE TABLE migrations.init_migrations (
    version bigint,
    dirty boolean
);

CREATE TABLE public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL,
    name text NOT NULL
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_rebac_read ON public.projects
    FOR SELECT TO anon_user
    USING (auth.has_relation('Tenant', tenant_id, 'view_project'));

INSERT INTO permissions.keto_uuid_mappings (id, string_representation) VALUES
    ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222'),
    ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444');

INSERT INTO permissions.keto_relation_tuples
    (namespace, object, relation, subject_id, subject_set_namespace, subject_set_object)
VALUES
    ('Tenant', '11111111-1111-1111-1111-111111111111', 'view_project',
     '22222222-2222-2222-2222-222222222222', NULL, NULL),
    ('StorageObject', '44444444-4444-4444-4444-444444444444', 'owner',
     '22222222-2222-2222-2222-222222222222', NULL, NULL);

INSERT INTO permissions.roles (tenant_id, role_name, permissions, user_ids) VALUES
    ('11111111-1111-1111-1111-111111111111', 'owner', ARRAY['tenant#view_users'],
     ARRAY['22222222-2222-2222-2222-222222222222']::uuid[]);

INSERT INTO auth.tenants (id, name, type) VALUES
    ('11111111-1111-1111-1111-111111111111', 'acme', 'team');

INSERT INTO auth.tenant_users (id, tenant_id, user_id, role, is_active) VALUES
    ('99999999-9999-9999-9999-999999999999',
     '11111111-1111-1111-1111-111111111111',
     '22222222-2222-2222-2222-222222222222', 'owner', true);

INSERT INTO auth.identities (id, secret) VALUES
    ('kratos-identity', 'kratos-secret');

INSERT INTO migrations.init_migrations (version, dirty) VALUES (1, false);

INSERT INTO public.projects (tenant_id, name) VALUES
    ('11111111-1111-1111-1111-111111111111', 'project-one');

INSERT INTO storage.objects (id, bucket_name, path, tenant_id, user_id) VALUES
    ('44444444-4444-4444-4444-444444444444', 'bucket', 'shared/file.txt',
     '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
`
