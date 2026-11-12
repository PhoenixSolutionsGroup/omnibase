package permissions

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMergePermissions(t *testing.T) {
	t.Run("appends only missing permissions", func(t *testing.T) {
		merged, added := mergePermissions(
			[]string{"tenant#invite_user"},
			[]string{"tenant#invite_user", "tenant#send_email"},
		)
		assert.Equal(t, []string{"tenant#invite_user", "tenant#send_email"}, merged)
		assert.Equal(t, []string{"tenant#send_email"}, added)
	})

	t.Run("returns no additions when existing is a superset", func(t *testing.T) {
		merged, added := mergePermissions(
			[]string{"tenant#invite_user", "tenant#custom"},
			[]string{"tenant#invite_user"},
		)
		assert.Equal(t, []string{"tenant#invite_user", "tenant#custom"}, merged)
		assert.Empty(t, added)
	})
}
