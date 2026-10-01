package db_test

import (
	"context"
	"errors"
	"strings"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	claimsUser = `{"user_id":"22222222-2222-2222-2222-222222222222","tenant_id":"11111111-1111-1111-1111-111111111111"}`

	tenantID = "11111111-1111-1111-1111-111111111111"

	hasRelationSig    = "auth.has_relation(text,text,text)"
	hasAnyRelSig      = "auth.has_any_relation(text,text,text[])"
	activeUserRoleSig = "auth.active_user_role()"
)

func TestRLSHelpersSecurityDefiner(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	admin := connect(t, sharedPostgres(t)+"/db?sslmode=disable")
	before := scopedDB(t, admin, "000018")
	after := scopedDB(t, admin, "000019")

	t.Run("helpers_return_correct_result_in_both_states", func(t *testing.T) {
		for state, conn := range map[string]*pgx.Conn{"before": before, "after": after} {
			t.Run(state, func(t *testing.T) {
				var relation bool
				var role string
				asRole(t, conn, "anon_user", claimsUser, func(tx pgx.Tx) {
					require.NoError(t, tx.QueryRow(context.Background(),
						`SELECT auth.has_relation('Tenant', $1, 'view_project')`, tenantID).Scan(&relation))
					require.NoError(t, tx.QueryRow(context.Background(),
						`SELECT auth.has_any_relation('Tenant', $1, ARRAY['view_project'])`, tenantID).Scan(&relation))
					require.NoError(t, tx.QueryRow(context.Background(),
						`SELECT auth.active_user_role()`).Scan(&role))
				})
				assert.True(t, relation)
				assert.Equal(t, "owner", role)
			})
		}
	})

	t.Run("policy_returns_identical_rows_in_both_states", func(t *testing.T) {
		assert.Equal(t, 1, storageVisible(t, before))
		assert.Equal(t, 1, storageVisible(t, after))
	})

	t.Run("anon_user_can_directly_read_permissions_before_and_not_after", func(t *testing.T) {
		beforeRoles := anonQueryErr(t, before, `SELECT count(*) FROM permissions.roles`)
		afterRoles := anonQueryErr(t, after, `SELECT count(*) FROM permissions.roles`)
		beforeTuples := anonQueryErr(t, before, `SELECT count(*) FROM permissions.keto_relation_tuples`)
		afterTuples := anonQueryErr(t, after, `SELECT count(*) FROM permissions.keto_relation_tuples`)

		require.NoError(t, beforeRoles)
		require.NoError(t, beforeTuples)
		assert.Equal(t, "42501", pgErrCode(afterRoles))
		assert.Equal(t, "42501", pgErrCode(afterTuples))
	})

	t.Run("search_path_is_pinned_only_after_conversion", func(t *testing.T) {
		for _, fn := range []string{"has_relation", "has_any_relation", "active_user_role"} {
			assert.False(t, hasPinnedSearchPath(proconfig(t, before, fn)))
			assert.True(t, hasPinnedSearchPath(proconfig(t, after, fn)))
		}
	})

	t.Run("public_execute_revoked_and_anon_execute_retained", func(t *testing.T) {
		assert.True(t, hasFunctionPrivilege(t, before, "public", hasRelationSig))
		assert.False(t, hasFunctionPrivilege(t, after, "public", hasRelationSig))

		assert.True(t, hasFunctionPrivilege(t, before, "anon_user", hasRelationSig))
		assert.True(t, hasFunctionPrivilege(t, after, "anon_user", hasRelationSig))
		assert.True(t, hasFunctionPrivilege(t, after, "anon_user", hasAnyRelSig))
		assert.True(t, hasFunctionPrivilege(t, after, "anon_user", activeUserRoleSig))
	})

	t.Run("definer_owner_is_not_superuser", func(t *testing.T) {
		for _, fn := range []string{"has_relation", "has_any_relation", "active_user_role"} {
			super, bypass := functionOwnerFlags(t, after, fn)
			assert.False(t, super)
			assert.True(t, bypass)
		}
	})

	t.Run("inner_table_rls_does_not_filter_helper_after_conversion", func(t *testing.T) {
		innerRLSHelper(t, before, false)
		innerRLSHelper(t, after, true)
		innerRLSStorage(t, before, 0)
		innerRLSStorage(t, after, 1)
	})
}

func asRole(t *testing.T, conn *pgx.Conn, role, claims string, fn func(tx pgx.Tx)) {
	t.Helper()
	ctx := context.Background()
	tx, err := conn.Begin(ctx)
	require.NoError(t, err)
	defer func() { _ = tx.Rollback(ctx) }()
	_, err = tx.Exec(ctx, "SET LOCAL ROLE "+pgx.Identifier{role}.Sanitize())
	require.NoError(t, err)
	_, err = tx.Exec(ctx, "SELECT set_config('request.jwt.claims', $1, true)", claims)
	require.NoError(t, err)
	fn(tx)
}

func anonQueryErr(t *testing.T, conn *pgx.Conn, sql string) error {
	t.Helper()
	var err error
	asRole(t, conn, "anon_user", claimsUser, func(tx pgx.Tx) {
		var n int
		err = tx.QueryRow(context.Background(), sql).Scan(&n)
	})
	return err
}

func storageVisible(t *testing.T, conn *pgx.Conn) int {
	t.Helper()
	var n int
	asRole(t, conn, "anon_user", claimsUser, func(tx pgx.Tx) {
		require.NoError(t, tx.QueryRow(context.Background(),
			`SELECT count(*) FROM storage.objects`).Scan(&n))
	})
	return n
}

func innerRLSHelper(t *testing.T, conn *pgx.Conn, want bool) {
	t.Helper()
	ctx := context.Background()
	tx, err := conn.Begin(ctx)
	require.NoError(t, err)
	defer func() { _ = tx.Rollback(ctx) }()
	_, err = tx.Exec(ctx, `ALTER TABLE permissions.keto_relation_tuples ENABLE ROW LEVEL SECURITY`)
	require.NoError(t, err)
	_, err = tx.Exec(ctx, `SET LOCAL ROLE "anon_user"`)
	require.NoError(t, err)
	_, err = tx.Exec(ctx, `SELECT set_config('request.jwt.claims', $1, true)`, claimsUser)
	require.NoError(t, err)
	var relation bool
	require.NoError(t, tx.QueryRow(ctx,
		`SELECT auth.has_relation('Tenant', $1, 'view_project')`, tenantID).Scan(&relation))
	assert.Equal(t, want, relation)
}

func innerRLSStorage(t *testing.T, conn *pgx.Conn, want int) {
	t.Helper()
	ctx := context.Background()
	tx, err := conn.Begin(ctx)
	require.NoError(t, err)
	defer func() { _ = tx.Rollback(ctx) }()
	_, err = tx.Exec(ctx, `ALTER TABLE permissions.keto_relation_tuples ENABLE ROW LEVEL SECURITY`)
	require.NoError(t, err)
	_, err = tx.Exec(ctx, `SET LOCAL ROLE "anon_user"`)
	require.NoError(t, err)
	_, err = tx.Exec(ctx, `SELECT set_config('request.jwt.claims', $1, true)`, claimsUser)
	require.NoError(t, err)
	var n int
	require.NoError(t, tx.QueryRow(ctx, `SELECT count(*) FROM storage.objects`).Scan(&n))
	assert.Equal(t, want, n)
}

func hasPinnedSearchPath(cfg []string) bool {
	for _, c := range cfg {
		if strings.HasPrefix(c, "search_path=") {
			return true
		}
	}
	return false
}

func proconfig(t *testing.T, conn *pgx.Conn, proname string) []string {
	t.Helper()
	var cfg []string
	require.NoError(t, conn.QueryRow(context.Background(),
		`SELECT coalesce(p.proconfig, ARRAY[]::text[])
		   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
		  WHERE n.nspname = 'auth' AND p.proname = $1`, proname).Scan(&cfg))
	return cfg
}

func hasFunctionPrivilege(t *testing.T, conn *pgx.Conn, role, sig string) bool {
	t.Helper()
	var ok bool
	require.NoError(t, conn.QueryRow(context.Background(),
		`SELECT has_function_privilege($1, $2, 'EXECUTE')`, role, sig).Scan(&ok))
	return ok
}

func functionOwnerFlags(t *testing.T, conn *pgx.Conn, proname string) (super, bypass bool) {
	t.Helper()
	require.NoError(t, conn.QueryRow(context.Background(),
		`SELECT r.rolsuper, r.rolbypassrls
		   FROM pg_proc p
		   JOIN pg_namespace n ON n.oid = p.pronamespace
		   JOIN pg_roles r ON r.oid = p.proowner
		  WHERE n.nspname = 'auth' AND p.proname = $1`, proname).Scan(&super, &bypass))
	return super, bypass
}

func pgErrCode(err error) string {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code
	}
	return ""
}
