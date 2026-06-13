import type { BaseDMMF, DMMF } from "@prisma/client/runtime/library";

let _schema: Map<string, DMMF.Model> | null = null;

export function loadSchema(dmmf: BaseDMMF): void {
  _schema = new Map();
  for (const model of dmmf.datamodel.models) {
    _schema.set(model.name.toLowerCase(), model);
  }
}

export function hasModel(modelName: string): boolean {
  return _schema?.has(modelName.toLowerCase()) ?? false;
}

function ensureSchema(): void {
  if (!_schema) {
    throw new Error(
      "loadSchema(Prisma.dmmf) has not been called before generating RLS policies (needed to resolve relation FK columns).",
    );
  }
}

function getModel(modelName: string): DMMF.Model {
  ensureSchema();
  const model = _schema!.get(modelName.toLowerCase());
  if (!model) {
    throw new Error(`Model "${modelName}" not found in DMMF; check loadSchema() received the correct Prisma.dmmf.`);
  }
  return model;
}

export function lookupField(modelName: string, fieldName: string): DMMF.Field {
  const field = getModel(modelName).fields.find((f) => f.name === fieldName);
  if (!field) {
    throw new Error(`Field "${fieldName}" not found on model "${modelName}"; check the relation name in your policy predicate.`);
  }
  return field;
}

export function resolveParentFk(modelName: string, fieldName: string): string {
  const field = lookupField(modelName, fieldName);
  if (field.kind !== "object") {
    throw new Error(`Field "${fieldName}" on model "${modelName}" is "${field.kind}", not a relation; cannot traverse to parent.`);
  }
  if (!field.relationFromFields?.length) {
    throw new Error(`Field "${fieldName}" on model "${modelName}" is a list relation (no FK on this side); use \`{ some: { ... } }\` to traverse children.`);
  }
  return field.relationFromFields[0];
}

export function resolveChildFk(modelName: string, fieldName: string): string {
  const field = lookupField(modelName, fieldName);
  if (field.kind !== "object") {
    throw new Error(`Field "${fieldName}" on model "${modelName}" is "${field.kind}", not a relation.`);
  }
  if (!field.relationName) {
    throw new Error(`Field "${fieldName}" on model "${modelName}" has no relationName.`);
  }
  if (!hasModel(field.type)) {
    throw new Error(`Target model "${field.type}" not found in DMMF for field "${fieldName}" on "${modelName}".`);
  }
  const inverse = getModel(field.type).fields.find(
    (f) =>
      f.relationName === field.relationName &&
      f.relationFromFields != null &&
      f.relationFromFields.length > 0,
  );
  if (!inverse?.relationFromFields?.length) {
    throw new Error(`No inverse FK found for relation "${field.relationName}" on model "${field.type}".`);
  }
  return inverse.relationFromFields[0];
}

export function resolveTableName(modelName: string): string {
  return _schema?.get(modelName.toLowerCase())?.dbName ?? modelName;
}
