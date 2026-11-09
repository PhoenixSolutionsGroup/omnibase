package permissions

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const parserFixture = `
import { Context, Namespace } from "./types";

export class User implements Namespace {}

export class Tenant implements Namespace {
  related: {
    /**
     * @group User Management
     * @displayName Invite Users
     * @role owner
     * @role admin
     */
    can_invite_user: User[];

    owner: (User | ApiKey)[];
  };

  permits = {
    invite_user: (ctx: Context): boolean =>
      this.related.can_invite_user.includes(ctx.subject),

    nested: (ctx: Context): boolean => {
      const lookup = { ignored: true };
      return lookup.ignored && this.related.owner.includes(ctx.subject);
    },
  };
}
`

func TestParseNamespaceContent(t *testing.T) {
	defs := ParseNamespaceFiles(map[string]string{"tenants.ts": parserFixture})
	require.Len(t, defs, 2)
	assert.Equal(t, "User", defs[0].Namespace)

	def := defs[1]
	assert.Equal(t, "Tenant", def.Namespace)
	assert.Equal(t, "tenants.ts", def.File)
	assert.Equal(t, []string{"can_invite_user", "owner"}, def.Relations)
	assert.Equal(t, []string{"invite_user", "nested"}, def.Permits)
	assert.Equal(t, []string{"owner", "admin"}, def.RelationsMetadata[0].Roles)
	assert.Equal(t, []string{"User", "ApiKey"}, def.RelationsMetadata[1].Subjects)
}

func TestParseNamespaceFilesSkipsTypes(t *testing.T) {
	defs := ParseNamespaceFiles(map[string]string{
		"types.ts": `export interface Namespace {}`,
		"storage.ts": `class StorageObject implements Namespace {
  permits = { read: (ctx: Context): boolean => true };
}`,
	})
	require.Len(t, defs, 1)
	assert.Equal(t, "StorageObject", defs[0].Namespace)
	assert.Equal(t, []string{"read"}, defs[0].Permits)
}

func TestValidateRequirements(t *testing.T) {
	required := []ParsedNamespaceDefinition{
		{Namespace: "Tenant", Relations: []string{"can_invite_user"}, Permits: []string{"invite_user"}},
		{Namespace: "StorageObject", Relations: []string{"owner"}, Permits: []string{"read"}},
	}

	t.Run("accepts supersets", func(t *testing.T) {
		supplied := []ParsedNamespaceDefinition{
			{Namespace: "Tenant", Relations: []string{"can_invite_user", "extra"}, Permits: []string{"invite_user"}},
			{Namespace: "StorageObject", Relations: []string{"owner"}, Permits: []string{"read", "write"}},
		}
		assert.Empty(t, ValidateRequirements(supplied, required))
	})

	t.Run("names missing namespace", func(t *testing.T) {
		missing := ValidateRequirements(nil, required)
		require.Len(t, missing, 2)
		assert.True(t, missing[0].MissingNamespace)
		assert.Contains(t, FormatMissing(missing), "Tenant (namespace missing)")
	})

	t.Run("names missing relations and permits", func(t *testing.T) {
		supplied := []ParsedNamespaceDefinition{
			{Namespace: "Tenant", Relations: nil, Permits: []string{"invite_user"}},
			{Namespace: "StorageObject", Relations: []string{"owner"}, Permits: nil},
		}
		missing := ValidateRequirements(supplied, required)
		require.Len(t, missing, 2)
		assert.Equal(t, []string{"can_invite_user"}, missing[0].Relations)
		assert.Equal(t, []string{"read"}, missing[1].Permits)
		assert.Contains(t, FormatMissing(missing), "relations missing: can_invite_user")
		assert.Contains(t, FormatMissing(missing), "permits missing: read")
	})
}
