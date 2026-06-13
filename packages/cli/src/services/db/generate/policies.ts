export type AuthCtx = {
  userId: string;
  tenantId: string;
  role: string | null;
};

export type Operation = "insert" | "select" | "update" | "delete";

export type Pred<T> = T | boolean;

type AnonPred<T> = Pred<T>;
type AuthPred<T> = Pred<T> | ((auth: AuthCtx) => Pred<T>);

export type PolicyDef<T> = {
  select?: RolePolicy<T, "using">;
  insert?: RolePolicy<T, "check">;
  update?: RolePolicy<T, "using" | "check">;
  delete?: RolePolicy<T, "using">;
};

type RolePolicy<T, Clauses extends "using" | "check"> = {
  anon: { [K in Clauses]?: AnonPred<T> };
  auth?: { [K in Clauses]?: AuthPred<T> };
};

export type Clause = "using" | "check";
export type Role = "anon" | "auth";

export type CompiledRole = {
  anon?: unknown;
  auth?: unknown;
};
export type CompiledOp = Partial<Record<Clause, CompiledRole>>;
export type CompiledEntry = Partial<Record<Operation, CompiledOp>>;

const registry = new Map<string, CompiledEntry>();

function compileOp(def: Record<string, any>): CompiledOp {
  const compiled: CompiledOp = {};

  if (def.anon?.using !== undefined || def.auth?.using !== undefined) {
    const role: CompiledRole = {};
    if (def.anon?.using !== undefined) role.anon = def.anon.using;
    if (def.auth?.using !== undefined) role.auth = def.auth.using;
    compiled.using = role;
  }

  if (def.anon?.check !== undefined || def.auth?.check !== undefined) {
    const role: CompiledRole = {};
    if (def.anon?.check !== undefined) role.anon = def.anon.check;
    if (def.auth?.check !== undefined) role.auth = def.auth.check;
    compiled.check = role;
  }

  return compiled;
}

export function definePolicy<T>(model: string, policy: PolicyDef<T>): void {
  for (const op of ["select", "insert", "update", "delete"] as Operation[]) {
    const def = policy[op];
    if (def && def.anon === undefined) {
      throw new Error(
        `Policy "${model}.${op}" must declare \`anon\` ` +
        `(use \`anon: { using: false }\` to deny anonymous access).`,
      );
    }
  }

  const entry: CompiledEntry = {};
  if (policy.select) entry.select = compileOp(policy.select);
  if (policy.insert) entry.insert = compileOp(policy.insert);
  if (policy.update) entry.update = compileOp(policy.update);
  if (policy.delete) entry.delete = compileOp(policy.delete);
  registry.set(model, entry);
}


export function getRegistry(): Map<string, CompiledEntry> {
  return registry;
}

export function clearRegistry(): void {
  registry.clear();
}
