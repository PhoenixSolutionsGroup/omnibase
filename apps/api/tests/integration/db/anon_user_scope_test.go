package db_test

import (
	"context"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const storageObjectID = "44444444-4444-4444-4444-444444444444"

func TestAnonUserScopeNarrowing(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	admin := connect(t, sharedPostgres(t)+"/db?sslmode=disable")
	before := scopedDB(t, admin, "000019")
	after := scopedDB(t, admin, "000020")

	t.Run("intended_access_preserved", func(t *testing.T) {
		for state, conn := range map[string]*pgx.Conn{"before": before, "after": after} {
			t.Run(state, func(t *testing.T) {
				var relation, anyRelation bool
				var role string
				asRole(t, conn, "anon_user", claimsUser, func(tx pgx.Tx) {
					require.NoError(t, tx.QueryRow(context.Background(),
						`SELECT auth.has_relation('Tenant', $1, 'view_project')`, tenantID).Scan(&relation))
					require.NoError(t, tx.QueryRow(context.Background(),
						`SELECT auth.has_any_relation('StorageObject', $1, ARRAY['owner'])`, storageObjectID).Scan(&anyRelation))
					require.NoError(t, tx.QueryRow(context.Background(),
						`SELECT auth.active_user_role()`).Scan(&role))
				})
				assert.True(t, relation)
				assert.True(t, anyRelation)
				assert.Equal(t, "owner", role)

				assert.Equal(t, 1, scopeCount(t, conn, `SELECT count(*) FROM storage.objects`))
				assert.Equal(t, 1, scopeCount(t, conn, `SELECT count(*) FROM auth.tenants`))

				assert.True(t, hasTablePrivilege(t, conn, "anon_user", "storage.objects", "SELECT"))
				assert.True(t, hasTablePrivilege(t, conn, "anon_user", "storage.objects", "INSERT"))
				assert.True(t, hasTablePrivilege(t, conn, "anon_user", "auth.tenants", "SELECT"))
				assert.True(t, hasTablePrivilege(t, conn, "anon_user", "auth.tenant_users", "SELECT"))
			})
		}
	})

	t.Run("public_surface_enabled_by_migration", func(t *testing.T) {
		assert.Equal(t, "42501", pgErrCode(anonQueryErr(t, before, `SELECT count(*) FROM public.projects`)))
		assert.Equal(t, 1, scopeCount(t, after, `SELECT count(*) FROM public.projects`))

		assert.False(t, defaultSelectForAnon(t, before, "public"))
		assert.True(t, defaultSelectForAnon(t, after, "public"))
	})

	t.Run("non_public_schemas_are_closed", func(t *testing.T) {
		restricted := []string{
			`SELECT count(*) FROM auth.identities`,
			`SELECT count(*) FROM stripe.stripe_configs`,
			`SELECT count(*) FROM stripe.stripe_webhooks`,
			`SELECT count(*) FROM email.templates`,
			`SELECT count(*) FROM migrations.init_migrations`,
			`SELECT count(*) FROM permissions.roles`,
		}
		for _, query := range restricted {
			assert.Equal(t, "42501", pgErrCode(anonQueryErr(t, before, query)), query)
			assert.Equal(t, "42501", pgErrCode(anonQueryErr(t, after, query)), query)
		}

		for _, schema := range []string{"stripe", "email", "migrations", "permissions"} {
			assert.False(t, hasSchemaUsage(t, before, "anon_user", schema), schema)
			assert.False(t, hasSchemaUsage(t, after, "anon_user", schema), schema)
		}
		for _, schema := range []string{"public", "auth", "storage"} {
			assert.True(t, hasSchemaUsage(t, before, "anon_user", schema), schema)
			assert.True(t, hasSchemaUsage(t, after, "anon_user", schema), schema)
		}

		assert.False(t, defaultSelectForAnon(t, before, "auth"))
		assert.False(t, defaultSelectForAnon(t, after, "auth"))
	})
}

func scopeCount(t *testing.T, conn *pgx.Conn, sql string) int {
	t.Helper()
	var n int
	asRole(t, conn, "anon_user", claimsUser, func(tx pgx.Tx) {
		require.NoError(t, tx.QueryRow(context.Background(), sql).Scan(&n))
	})
	return n
}

func hasTablePrivilege(t *testing.T, conn *pgx.Conn, role, table, privilege string) bool {
	t.Helper()
	var ok bool
	require.NoError(t, conn.QueryRow(context.Background(),
		`SELECT has_table_privilege($1, $2, $3)`, role, table, privilege).Scan(&ok))
	return ok
}

func hasSchemaUsage(t *testing.T, conn *pgx.Conn, role, schema string) bool {
	t.Helper()
	var ok bool
	require.NoError(t, conn.QueryRow(context.Background(),
		`SELECT has_schema_privilege($1, $2, 'USAGE')`, role, schema).Scan(&ok))
	return ok
}

func defaultSelectForAnon(t *testing.T, conn *pgx.Conn, schema string) bool {
	t.Helper()
	ctx := context.Background()
	tx, err := conn.Begin(ctx)
	require.NoError(t, err)
	defer func() { _ = tx.Rollback(ctx) }()
	_, err = tx.Exec(ctx, "CREATE TABLE "+schema+".dp_probe (id int)")
	require.NoError(t, err)
	var ok bool
	require.NoError(t, tx.QueryRow(ctx,
		`SELECT has_table_privilege('anon_user', $1, 'SELECT')`, schema+".dp_probe").Scan(&ok))
	return ok
}
