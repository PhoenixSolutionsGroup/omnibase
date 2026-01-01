# OpenAPI Schema Guidelines

## Handling `oneOf` Schemas

When using `oneOf` in OpenAPI schemas, **always use named `$ref` schemas** instead of inline objects. This ensures the generated SDK types have meaningful names.

### Bad (generates `OneOf`, `OneOf1`, etc.)

```yaml
MyRequest:
  oneOf:
    - type: object
      properties:
        field_a: ...
    - type: object
      properties:
        field_b: ...
```

### Good (generates `MyRequestWithFieldA`, `MyRequestWithFieldB`)

```yaml
MyRequestWithFieldA:
  type: object
  properties:
    field_a: ...

MyRequestWithFieldB:
  type: object
  properties:
    field_b: ...

MyRequest:
  oneOf:
    - $ref: '#/components/schemas/MyRequestWithFieldA'
    - $ref: '#/components/schemas/MyRequestWithFieldB'
```

This applies to all `oneOf` schemas that will be used in request/response bodies.
