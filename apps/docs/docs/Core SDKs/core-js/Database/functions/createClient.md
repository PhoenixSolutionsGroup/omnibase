# Function: createClient()

> **createClient**\<`T`\>(`url`, `anonKey`, `getCookie`): `PostgrestClient`\<`T`\>

Defined in: [database/client.ts:103](https://github.com/PhoenixSolutionsGroup/omnibase/blob/52b2e10cfa3b1e29a2da7bc2b05f6fe1e4c9061d/sdk/core-js/src/database/client.ts#L103)

Creates a PostgREST client for database operations

This function creates a configured PostgREST client that handles authentication
through JWT tokens. It supports both cookie-based authentication (for server-side
usage) and fallback to anonymous keys. The client provides a type-safe interface
for database operations when used with generated TypeScript types.

The client automatically handles authentication headers and provides access to
all PostgREST functionality including queries, mutations, and real-time subscriptions.

## Type Parameters

### T

`T` = `any`

Database schema types for type-safe operations. Should be generated
              from your database schema using a tool like Supabase CLI or Omnibase CLI

## Parameters

### url

`string`

The PostgREST API endpoint URL (e.g., 'https://api.example.com/rest/v1')

### anonKey

`string`

Anonymous/public API key used as fallback when no JWT token is available

### getCookie

(`cookie`) => `string`

Function to retrieve cookies by name, typically used to get JWT tokens

## Returns

`PostgrestClient`\<`T`\>

A configured PostgREST client instance with authentication headers set

## Examples

Browser usage with cookie authentication:
```typescript
import { createClient } from '@omnibase/core-js/database';

interface DatabaseTypes {
  users: {
    Row: { id: string; email: string; name: string };
    Insert: { email: string; name: string };
    Update: { email?: string; name?: string };
  };
}

const client = createClient<DatabaseTypes>(
  'https://api.example.com/rest/v1',
  'your-anon-key',
  (name) => document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1] || ''
);

// Type-safe query
const { data, error } = await client
  .from('users')
  .select('id, email, name')
  .eq('email', 'user@example.com');
```

Node.js usage with custom JWT retrieval:
```typescript
import { createClient } from '@omnibase/core-js/database';

const client = createClient(
  process.env.POSTGREST_URL!,
  process.env.POSTGREST_ANON_KEY!,
  (name) => {
    // Custom logic to retrieve JWT from request headers, session, etc.
    return getJwtFromSession(name) || '';
  }
);

// Insert new record
const { data, error } = await client
  .from('users')
  .insert({ email: 'new@example.com', name: 'New User' })
  .select();
```

Advanced usage with error handling:
```typescript
const client = createClient<DatabaseTypes>(
  'https://api.example.com/rest/v1',
  'your-anon-key',
  (name) => getCookieValue(name)
);

try {
  const { data, error } = await client
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Database error:', error.message);
    return;
  }

  console.log('Users:', data);
} catch (err) {
  console.error('Network error:', err);
}
```

## Since

1.0.0
