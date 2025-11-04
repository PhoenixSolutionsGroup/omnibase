# Database

Database module

This module provides database connectivity functionality for PostgreSQL
databases using PostgREST. It offers a type-safe client for interacting
with your database through RESTful APIs.

Key features:
- Type-safe database operations with TypeScript support
- JWT-based authentication with automatic token handling
- Cookie-based authentication support
- Direct integration with PostgREST API
- Automatic schema inference and type generation support

## Example

Basic usage:
```typescript
import { createClient } from '@omnibase/core-js/database';

const db = createClient<DatabaseTypes>(
  'https://api.example.com/rest/v1',
  'your-anon-key',
  (name) => document.cookie.split('; ').find(row => row.startsWith(name))?.split('=')[1] || ''
);

// Query data
const { data } = await db.from('users').select('*');
```

## Classes

- [EventsClient](classes/EventsClient.md)

## Functions

- [createClient](functions/createClient.md)

## Interfaces

- [StatusMessage](interfaces/StatusMessage.md)
- [Subscription](interfaces/Subscription.md)
- [SubscriptionMessage](interfaces/SubscriptionMessage.md)
- [SubscriptionOptions](interfaces/SubscriptionOptions.md)
- [UpdateMessage](interfaces/UpdateMessage.md)
