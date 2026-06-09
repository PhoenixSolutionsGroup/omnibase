import type { Args } from "@prisma/client/runtime/library";

// Authenticated request context. Only ever passed to `auth` predicate
// functions — anonymous requests have no user, so anon predicates are static.
export type AuthCtx = {
  userId: string;
  tenantId: string;
  role: string | null;
};

export type Operation = "insert" | "select" | "update" | "delete";

// A predicate is a Prisma `where` filter, or a boolean (true = allow all rows,
// false = deny). Returning a filter restricts the rows the policy applies to.
export type Pred<T> = NonNullable<Args<T, "findMany">["where"]> | boolean;

// anon: no auth context available, so it must be static.
type AnonPred<T> = Pred<T>;
// auth: a static filter, a function of the authenticated context, or a boolean.
type AuthPred<T> = Pred<T> | ((auth: AuthCtx) => Pred<T>);

// SELECT / INSERT / DELETE: a single predicate per role.
//   select/delete -> USING, insert -> WITH CHECK.
// `anon` is required: anonymous access must be an explicit decision
// (`anon: false` to deny). `auth` is optional (omitted -> denied).
type SimpleOp<T> = {
  anon: AnonPred<T>;
  auth?: AuthPred<T>;
};

// UPDATE has both USING (which rows can be updated) and WITH CHECK (what the new
// row may look like). A bare predicate is shorthand for "both"; pass an object
// to set them independently. `anon` is required, as above.
type UpdateOp<T> = {
  anon: AnonPred<T> | { using?: AnonPred<T>; check?: AnonPred<T> };
  auth?: AuthPred<T> | { using?: AuthPred<T>; check?: AuthPred<T> };
};

export type PolicyDef<T> = {
  select?: SimpleOp<T>;
  insert?: SimpleOp<T>;
  update?: UpdateOp<T>;
  delete?: SimpleOp<T>;
};

// ── Compiled (normalized) shape stored in the registry ──────────────
// Every operation is reduced to USING and/or WITH CHECK clauses, each holding
// the per-role predicate. This is what the SQL generator and runtime consume.

export type Clause = "using" | "check";
export type Role = "anon" | "auth";

export type CompiledRole = {
  anon?: AnonPred<unknown>;
  auth?: AuthPred<unknown>;
};
export type CompiledOp = Partial<Record<Clause, CompiledRole>>;
export type CompiledEntry = Partial<Record<Operation, CompiledOp>>;

const registry = new Map<string, CompiledEntry>();

function isUsingCheckWrapper(v: unknown): v is { using?: unknown; check?: unknown } {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const keys = Object.keys(v);
  if (keys.length === 0) return false;
  return keys.every((k) => k === "using" || k === "check");
}

// A bare predicate applies to both USING and WITH CHECK; an explicit
// { using, check } wrapper splits them.
function splitRole(v: unknown): { using?: unknown; check?: unknown } {
  if (v === undefined) return {};
  if (isUsingCheckWrapper(v)) return { using: v.using, check: v.check };
  return { using: v, check: v };
}

function compileSimple(op: SimpleOp<unknown>, clause: Clause): CompiledOp {
  const role: CompiledRole = {};
  if (op.anon !== undefined) role.anon = op.anon as AnonPred<unknown>;
  if (op.auth !== undefined) role.auth = op.auth as AuthPred<unknown>;
  return { [clause]: role };
}

function compileUpdate(op: UpdateOp<unknown>): CompiledOp {
  const anon = splitRole(op.anon);
  const auth = splitRole(op.auth);

  const using: CompiledRole = {};
  const check: CompiledRole = {};
  if (anon.using !== undefined) using.anon = anon.using as AnonPred<unknown>;
  if (auth.using !== undefined) using.auth = auth.using as AuthPred<unknown>;
  if (anon.check !== undefined) check.anon = anon.check as AnonPred<unknown>;
  if (auth.check !== undefined) check.auth = auth.check as AuthPred<unknown>;

  const out: CompiledOp = {};
  if (using.anon !== undefined || using.auth !== undefined) out.using = using;
  if (check.anon !== undefined || check.auth !== undefined) out.check = check;
  return out;
}

export function definePolicy<T>(model: string, policy: PolicyDef<T>): void {
  // Anonymous access is security-sensitive, so it must be a conscious decision:
  // every declared operation has to state `anon` (use `anon: false` to deny).
  for (const op of ["select", "insert", "update", "delete"] as Operation[]) {
    const def = policy[op] as { anon?: unknown } | undefined;
    if (def && def.anon === undefined) {
      throw new Error(
        `Policy "${model}.${op}" must declare \`anon\` ` +
          `(use \`anon: false\` to deny anonymous access, or e.g. \`anon: { published: true }\` to allow it).`,
      );
    }
  }

  const entry: CompiledEntry = {};
  if (policy.select) entry.select = compileSimple(policy.select, "using");
  if (policy.insert) entry.insert = compileSimple(policy.insert, "check");
  if (policy.delete) entry.delete = compileSimple(policy.delete, "using");
  if (policy.update) entry.update = compileUpdate(policy.update as UpdateOp<unknown>);
  registry.set(model, entry);
}

type RuntimeAuth = {
  userId: string | null;
  tenantId: string | null;
  role: string | null;
};

// Runtime predicate resolution (defense-in-depth filtering in the SDK). Picks
// the role by whether a user is present; a missing predicate for that role
// means "denied".
export function applyPolicy(
  model: string,
  operation: Operation,
  auth: RuntimeAuth,
): Record<string, unknown> | boolean {
  const entry = registry.get(model);
  if (!entry) return false;
  const op = entry[operation];
  if (!op) return false;

  const clause: Clause = operation === "insert" ? "check" : "using";
  const role = op[clause];
  if (!role) return false;

  const raw = auth.userId ? role.auth : role.anon;
  if (raw === undefined) return false;
  if (typeof raw === "function") {
    return normalizeResult(raw(auth as AuthCtx));
  }
  return normalizeResult(raw);
}

function normalizeResult(result: unknown): Record<string, unknown> | boolean {
  if (Array.isArray(result)) {
    if (result.length === 0) return true;
    if (result.length === 1) return result[0] as Record<string, unknown>;
    return { OR: result };
  }
  return result as Record<string, unknown> | boolean;
}

export function getRegistry(): Map<string, CompiledEntry> {
  return registry;
}

export function clearRegistry(): void {
  registry.clear();
}
