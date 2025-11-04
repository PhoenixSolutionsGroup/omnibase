# Interface: SubscriptionOptions

Defined in: database/events.ts:20

Subscription options for database events

## Properties

### columns?

> `optional` **columns**: `string`[]

Defined in: database/events.ts:24

Specific columns to filter updates (optional)

***

### onChange()?

> `optional` **onChange**: (`data`, `message`) => `void`

Defined in: database/events.ts:26

Callback function triggered on data updates

#### Parameters

##### data

`any`

##### message

[`UpdateMessage`](UpdateMessage.md)

#### Returns

`void`

***

### rowId?

> `optional` **rowId**: `string`

Defined in: database/events.ts:22

Specific row ID to subscribe to (optional)
