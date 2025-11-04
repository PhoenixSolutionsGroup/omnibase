# Class: EventsClient

Defined in: database/events.ts:111

Universal WebSocket client for real-time database events

Connects to the database events WebSocket endpoint and manages subscriptions
to table changes with automatic RLS authentication and reconnection.

## Examples

Basic usage:
```typescript
const client = new EventsClient(
  'ws://localhost:8080/api/v1/events/ws',
  'your-jwt-token'
);

client.subscribe('tasks', {
  onChange: (data) => {
    console.log('Task updated:', data);
  }
});
```

Subscribe to specific row:
```typescript
client.subscribe('users', {
  rowId: 123,
  onChange: (user) => {
    console.log('User 123 updated:', user);
  }
});
```

Subscribe to specific columns:
```typescript
client.subscribe('posts', {
  rowId: 456,
  columns: ['title', 'content', 'status'],
  onChange: (post) => {
    console.log('Post columns updated:', post);
  }
});
```

## Constructors

### Constructor

> **new EventsClient**(`url`, `jwt`): `EventsClient`

Defined in: database/events.ts:127

Creates a new EventsClient instance

#### Parameters

##### url

`string`

WebSocket endpoint URL (e.g., 'ws://localhost:8080/api/v1/events/ws')

##### jwt

`string`

JWT authentication token for RLS checks

#### Returns

`EventsClient`

## Methods

### close()

> **close**(): `void`

Defined in: database/events.ts:310

Close WebSocket connection and prevent reconnection

#### Returns

`void`

#### Example

```typescript
client.close();
```

***

### isConnected()

> **isConnected**(): `boolean`

Defined in: database/events.ts:320

Check if WebSocket is currently connected

#### Returns

`boolean`

true if connected, false otherwise

***

### subscribe()

> **subscribe**(`table`, `options`): `void`

Defined in: database/events.ts:195

Subscribe to database changes for a table

#### Parameters

##### table

`string`

Table name to subscribe to

##### options

[`SubscriptionOptions`](../interfaces/SubscriptionOptions.md) = `{}`

Subscription options (rowId, columns, onChange callback)

#### Returns

`void`

#### Examples

Subscribe to entire table:
```typescript
client.subscribe('tasks', {
  onChange: (task) => console.log('Task changed:', task)
});
```

Subscribe to specific row:
```typescript
client.subscribe('users', {
  rowId: 123,
  onChange: (user) => console.log('User 123 changed:', user)
});
```

***

### unsubscribe()

> **unsubscribe**(`table`, `rowId?`): `void`

Defined in: database/events.ts:231

Unsubscribe from database changes

#### Parameters

##### table

`string`

Table name to unsubscribe from

##### rowId?

`string`

Optional row ID (if subscribing to specific row)

#### Returns

`void`

#### Example

```typescript
client.unsubscribe('tasks');
client.unsubscribe('users', 123);
```

***

### updateJWT()

> **updateJWT**(`jwt`): `void`

Defined in: database/events.ts:293

Update JWT token for authentication

#### Parameters

##### jwt

`string`

New JWT token

#### Returns

`void`

#### Example

```typescript
client.updateJWT(newToken);
```
