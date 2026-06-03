export type Auth = {
  userId: string | null;
  tenantId: string | null;
  role: string | null;
};

export type Operation = "insert" | "select" | "update" | "delete";

export type PolicyResult<W> = W | W[] | true | false;

export type PolicyFn<W> = (auth: Auth) => PolicyResult<W>;

export type PolicyDefinition<W> = PolicyFn<W> | Partial<Record<Operation, PolicyFn<W>>>;

const registry = new Map<string, PolicyDefinition<any>>();

export function definePolicy<W>(
  model: string,
  policy: PolicyDefinition<W>,
): void {
  registry.set(model, policy);
}

export function applyPolicy(
  model: string,
  operation: Operation,
  auth: Auth,
): Record<string, unknown> | true | false {
  const policy = registry.get(model);
  if (!policy) return true;

  if (typeof policy === "function") {
    return normalizeResult(policy(auth));
  }

  const opFn = policy[operation];
  if (!opFn) return true;
  return normalizeResult(opFn(auth));
}

function normalizeResult(
  result: PolicyResult<any>,
): Record<string, unknown> | true | false {
  if (Array.isArray(result)) {
    if (result.length === 0) return true;
    if (result.length === 1) return result[0];
    return { OR: result };
  }
  return result;
}

export function getRegistry(): Map<string, PolicyDefinition<any>> {
  return registry;
}

export function clearRegistry(): void {
  registry.clear();
}
