import type { AuthCtx } from "../policies";
import {
  lookupField,
  resolveParentFk,
  resolveChildFk,
  resolveTableName,
} from "./schema";

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";
const MOCK_TENANT_ID = "00000000-0000-0000-0000-000000000002";

const SENTINEL_AUTH: AuthCtx = {
  userId: MOCK_USER_ID,
  tenantId: MOCK_TENANT_ID,
  role: "member",
};

function valToSql(val: unknown): string {
  if (val === true) return "true";
  if (val === false) return "false";
  if (typeof val === "number") return String(val);
  if (typeof val === "string") {
    if (val === MOCK_USER_ID) return "auth.user_id()";
    if (val === MOCK_TENANT_ID) return "auth.active_tenant_id()";
    if (/^[0-9a-f-]{36}$/i.test(val)) return `'${val}'::uuid`;
    return `'${val.replace(/'/g, "''")}'`;
  }
  return "''";
}

const isAuthExpr = (sql: string) => sql.startsWith("auth.");

function col(alias: string, k: string, rhs: string): string {
  return isAuthExpr(rhs) ? `${alias}.${k}::text` : `${alias}.${k}`;
}

function likePattern(value: unknown, prefix: string, suffix: string): string {
  const escaped = String(value)
    .replace(/[\\%_]/g, (c) => `\\${c}`)
    .replace(/'/g, "''");
  return `'${prefix}${escaped}${suffix}'`;
}

function arrayCompare(
  k: string,
  arr: unknown[],
  alias: string,
  negate: boolean,
): string {
  if (!arr.length) return negate ? "true" : "false";
  const vals = arr.map((x) => valToSql(x));
  const column = vals.some(isAuthExpr) ? `${alias}.${k}::text` : `${alias}.${k}`;
  const body = `${column} = ANY(ARRAY[${vals.join(", ")}])`;
  return negate ? `NOT (${body})` : body;
}

function scalarOp(
  k: string,
  op: string,
  val: unknown,
  alias: string,
  insensitive: boolean,
): string {
  const like = insensitive ? "ILIKE" : "LIKE";
  switch (op) {
    case "equals": {
      if (val === null) return `${alias}.${k} IS NULL`;
      const rhs = valToSql(val);
      if (insensitive) return `LOWER(${alias}.${k}) = LOWER(${rhs})`;
      return `${col(alias, k, rhs)} = ${rhs}`;
    }
    case "not": {
      if (val === null) return `${alias}.${k} IS NOT NULL`;
      if (val && typeof val === "object" && !Array.isArray(val)) {
        return `NOT (${scalarPred(k, val as Record<string, unknown>, alias)})`;
      }
      const rhs = valToSql(val);
      return `${col(alias, k, rhs)} IS DISTINCT FROM ${rhs}`;
    }
    case "lt":
    case "lte":
    case "gt":
    case "gte": {
      const sym = { lt: "<", lte: "<=", gt: ">", gte: ">=" }[op];
      const rhs = valToSql(val);
      return `${col(alias, k, rhs)} ${sym} ${rhs}`;
    }
    case "in":
      if (!Array.isArray(val)) throw new Error(`"in" value must be an array for field "${k}"`);
      return arrayCompare(k, val, alias, false);
    case "notIn":
      if (!Array.isArray(val)) throw new Error(`"notIn" value must be an array for field "${k}"`);
      return arrayCompare(k, val, alias, true);
    case "contains":
      return `${alias}.${k} ${like} ${likePattern(val, "%", "%")}`;
    case "startsWith":
      return `${alias}.${k} ${like} ${likePattern(val, "", "%")}`;
    case "endsWith":
      return `${alias}.${k} ${like} ${likePattern(val, "%", "")}`;
    default:
      throw new Error(`Unsupported filter on scalar field "${k}": ${op}`);
  }
}

function scalarPred(
  k: string,
  v: Record<string, unknown>,
  alias: string,
): string {
  const insensitive = v.mode === "insensitive";
  const ops = Object.keys(v).filter((o) => o !== "mode");
  const parts = ops.map((op) => scalarOp(k, op, v[op], alias, insensitive));
  return parts.length === 1 ? parts[0] : `(${parts.join(" AND ")})`;
}

function scalarListOp(
  k: string,
  op: string,
  val: unknown,
  alias: string,
): string {
  switch (op) {
    case "has":
      return `${valToSql(val)} = ANY(${alias}.${k})`;
    case "hasEvery":
      if (!Array.isArray(val)) throw new Error(`"hasEvery" value must be an array for field "${k}"`);
      return `${alias}.${k} @> ARRAY[${val.map(valToSql).join(", ")}]`;
    case "hasSome":
      if (!Array.isArray(val)) throw new Error(`"hasSome" value must be an array for field "${k}"`);
      return `${alias}.${k} && ARRAY[${val.map(valToSql).join(", ")}]`;
    case "isEmpty":
      return val ? `cardinality(${alias}.${k}) = 0` : `cardinality(${alias}.${k}) <> 0`;
    default:
      throw new Error(`Unsupported filter on array field "${k}": ${op}`);
  }
}

function scalarListPred(
  k: string,
  v: Record<string, unknown>,
  alias: string,
): string {
  const parts = Object.keys(v).map((op) => scalarListOp(k, op, v[op], alias));
  return parts.length === 1 ? parts[0] : `(${parts.join(" AND ")})`;
}

function relationPred(
  k: string,
  v: Record<string, unknown>,
  alias: string,
  model: string,
  type: string,
): string {
  const ikeys = Object.keys(v);
  const quantifier = ["some", "none", "every"].find(
    (q) => ikeys.length === 1 && ikeys[0] === q,
  );
  if (quantifier) {
    const fk = resolveChildFk(model, k);
    const where = `SELECT 1 FROM ${resolveTableName(type)} ${k} WHERE ${k}.${fk} = ${alias}.id`;
    const match = objToSql(v[quantifier], k, type);
    if (quantifier === "some") return `EXISTS (${where} AND ${match})`;
    if (quantifier === "none") return `NOT EXISTS (${where} AND ${match})`;
    return `NOT EXISTS (${where} AND NOT (${match}))`;
  }

  const fk = resolveParentFk(model, k);
  const from = `SELECT 1 FROM ${resolveTableName(type)} ${k} WHERE ${k}.id = ${alias}.${fk}`;
  if (ikeys.length === 1 && ikeys[0] === "is") {
    return v.is === null
      ? `NOT EXISTS (${from})`
      : `EXISTS (${from} AND ${objToSql(v.is, k, type)})`;
  }
  if (ikeys.length === 1 && ikeys[0] === "isNot") {
    return v.isNot === null
      ? `EXISTS (${from})`
      : `NOT EXISTS (${from} AND ${objToSql(v.isNot, k, type)})`;
  }
  return `EXISTS (${from} AND ${objToSql(v, k, type)})`;
}

function complexPred(
  k: string,
  v: Record<string, unknown>,
  alias: string,
  model: string,
): string {
  const field = lookupField(model, k);
  if (field.kind === "object") return relationPred(k, v, alias, model, field.type);
  if (field.isList) return scalarListPred(k, v, alias);
  return scalarPred(k, v, alias);
}

function fieldPred(
  k: string,
  v: unknown,
  alias: string,
  model: string,
): string {
  if (v === null || v === undefined) {
    try {
      const field = lookupField(model, k);
      if (field.kind === "object") {
        const fk = resolveParentFk(model, k);
        return `NOT EXISTS (SELECT 1 FROM ${resolveTableName(field.type)} ${k} WHERE ${k}.id = ${alias}.${fk})`;
      }
    } catch {
      // unknown model/field (e.g. no DMMF loaded): fall back to a scalar IS NULL
    }
    return `${alias}.${k} IS NULL`;
  }
  if (typeof v === "boolean" || typeof v === "number")
    return `${alias}.${k} = ${valToSql(v)}`;
  if (typeof v === "string") {
    const rhs = valToSql(v);
    return isAuthExpr(rhs)
      ? `${alias}.${k}::text = ${rhs}`
      : `${alias}.${k} = ${rhs}`;
  }
  if (Array.isArray(v)) return arrayCompare(k, v, alias, false);
  return complexPred(k, v as Record<string, unknown>, alias, model);
}

function combine(
  raw: unknown,
  joiner: "AND" | "OR",
  alias: string,
  model: string,
): string {
  const skip = joiner === "OR" ? "false" : "true";
  if (!Array.isArray(raw) || !raw.length) return skip;
  const items = raw
    .map((x) => objToSql(x, alias, model))
    .filter((s) => s !== skip);
  if (!items.length) return skip;
  return `( ${items.join(`\n    ${joiner} `)} )`;
}

function notPred(raw: unknown, alias: string, model: string): string {
  const inner = Array.isArray(raw)
    ? combine(raw, "OR", alias, model)
    : objToSql(raw, alias, model);
  if (inner === "true") return "false";
  if (inner === "false") return "true";
  return inner.startsWith("(") ? `NOT ${inner}` : `NOT (${inner})`;
}

export function objToSql(obj: unknown, alias: string, curModel?: string): string {
  if (!obj || typeof obj !== "object") return obj === false ? "false" : "true";
  const o = obj as Record<string, unknown>;
  const keys = Object.keys(o);
  if (!keys.length) return "true";

  const model = curModel ?? alias;
  const parts: string[] = [];
  for (const key of keys) {
    if (key === "AND") parts.push(combine(o.AND, "AND", alias, model));
    else if (key === "OR") parts.push(combine(o.OR, "OR", alias, model));
    else if (key === "NOT") parts.push(notPred(o.NOT, alias, model));
    else parts.push(fieldPred(key, o[key], alias, model));
  }

  const kept = parts.filter((s) => s !== "true");
  if (!kept.length) return "true";
  return kept.length === 1 ? kept[0] : kept.join("\n    AND ");
}

export function resolveAuth(raw: unknown): unknown {
  if (typeof raw === "function") {
    try {
      return (raw as (a: AuthCtx) => unknown)(SENTINEL_AUTH);
    } catch {
      return false;
    }
  }
  return raw;
}

export function authGuard(raw: unknown, table: string, currentModel?: string): string {
  if (raw === false) return "false";
  if (raw === true) return "auth.user_id() IS NOT NULL";
  const sql = objToSql(raw, table, currentModel);
  return `(auth.user_id() IS NOT NULL AND ${sql})`;
}
