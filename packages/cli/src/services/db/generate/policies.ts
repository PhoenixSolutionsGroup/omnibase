export type AuthCtx = {
  userId: string;
  tenantId: string;
  role: string | null;
};

export type Operation = "insert" | "select" | "update" | "delete";

const CAN = "__omnibase_can";

type NamespaceClass = abstract new (...args: never[]) => object;

type MemberNames<T, F extends string> = T extends { [P in F]?: infer X }
  ? X extends object
    ? Extract<keyof X, string>
    : never
  : never;

export type PermitOf<C extends NamespaceClass> = MemberNames<InstanceType<C>, "permits">;
export type RelationOf<C extends NamespaceClass> = MemberNames<InstanceType<C>, "related">;

export type CanPred = {
  readonly [CAN]: true;
  readonly namespace: string;
  readonly permit: string;
};

export function can<C extends NamespaceClass>(
  namespace: C,
  permit: PermitOf<C> | RelationOf<C>,
): CanPred {
  if (typeof namespace !== "function" || !namespace.name) {
    throw new Error("can() expects a permission namespace class, e.g. can(Document, \"view\")");
  }
  return { [CAN]: true, namespace: namespace.name, permit };
}

export function isCanPred(v: unknown): v is CanPred {
  return !!v && typeof v === "object" && (v as Record<string, unknown>)[CAN] === true;
}

type Where<T> = T | { [K in keyof T]?: T[K] | CanPred };

export type Pred<T> = Where<T> | boolean;

type AnonPred<T> = Pred<T>;
type AuthPred<T> = Pred<T> | ((auth: AuthCtx) => Pred<T>);

export type PolicyDef<T> = {
  select?: RolePolicy<T, "using">;
  insert?: RolePolicy<T, "check">;
  update?: RolePolicy<T, "using" | "check">;
  delete?: RolePolicy<T, "using">;
};

type RolePolicy<T, Clauses extends "using" | "check"> = {
  anon?: { [K in Clauses]?: AnonPred<T> };
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
    if (def && def.anon === undefined && def.auth === undefined) {
      throw new Error(
        `Policy "${model}.${op}" must declare at least one of ` +
        `\`anon\` or \`auth\` (use \`anon: { using: false }\` to deny anonymous access).`,
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
