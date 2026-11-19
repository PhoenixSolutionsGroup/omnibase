WITH ranked AS (
    SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY joined_at DESC) AS rn
    FROM auth.tenant_users
    WHERE is_active
)
UPDATE auth.tenant_users tu
SET is_active = false
FROM ranked
WHERE tu.id = ranked.id AND ranked.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS tenant_users_one_active
ON auth.tenant_users(user_id)
WHERE is_active;
