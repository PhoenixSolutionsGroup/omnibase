import ts from "typescript";

export type PermitRule =
  | { namespace: string; permit: string; kind: "relation"; source: string }
  | { namespace: string; permit: string; kind: "permit"; source: string }
  | {
      namespace: string;
      permit: string;
      kind: "traverse";
      source: string;
      viaPermit: string;
    };

export class UnsupportedPermitError extends Error {
  constructor(namespace: string, permit: string, detail: string) {
    super(
      `Permit ${namespace}.${permit} can't be used in database policies: ${detail}. ` +
        `Only ||, this.related.<relation>.includes(ctx.subject), this.permits.<permit>(ctx) ` +
        `and this.related.<relation>.traverse((x) => x.permits.<permit>(ctx)) are supported.`,
    );
    this.name = "UnsupportedPermitError";
  }
}

export type Expandable = { namespace: string; relation: string };

export type ParsedPermissionFile = {
  rules: PermitRule[];
  relationTargets: Record<string, Record<string, string[]>>;
  subjectSets: Expandable[];
};

export type PermitModel = {
  rules: PermitRule[];
  expandable: Expandable[];
};

export function extractPermitRules(source: string, fileName = "permissions.ts"): PermitRule[] {
  return parsePermissionFile(source, fileName).rules;
}

export function buildPermitModel(files: ParsedPermissionFile[]): PermitModel {
  const rules = dedupe(files.flatMap((f) => f.rules));
  const targets: Record<string, Record<string, string[]>> = {};
  for (const f of files) {
    for (const [ns, rels] of Object.entries(f.relationTargets)) {
      targets[ns] = { ...(targets[ns] ?? {}), ...rels };
    }
  }

  const expandable = new Map<string, Expandable>();
  const add = (namespace: string, relation: string) =>
    expandable.set(`${namespace}#${relation}`, { namespace, relation });

  for (const r of rules) {
    if (r.kind !== "traverse") {
      add(r.namespace, r.source);
      continue;
    }
    const linked = targets[r.namespace]?.[r.source];
    if (!linked || linked.length === 0) {
      throw new UnsupportedPermitError(
        r.namespace,
        r.permit,
        `relation "${r.source}" is traversed but has no namespace type in \`related\``,
      );
    }
    for (const target of linked) add(target, r.viaPermit);
  }
  for (const f of files) {
    for (const s of f.subjectSets) add(s.namespace, s.relation);
  }

  return { rules, expandable: [...expandable.values()] };
}

export function parsePermissionFile(source: string, fileName = "permissions.ts"): ParsedPermissionFile {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const rules: PermitRule[] = [];
  const relationTargets: Record<string, Record<string, string[]>> = {};
  const subjectSets: Expandable[] = [];

  for (const stmt of file.statements) {
    if (!ts.isClassDeclaration(stmt) || !stmt.name) continue;
    const namespace = stmt.name.text;

    for (const member of stmt.members) {
      if (!ts.isPropertyDeclaration(member) || !ts.isIdentifier(member.name)) continue;
      if (member.name.text === "related") {
        if (member.type && ts.isTypeLiteralNode(member.type)) {
          for (const rel of member.type.members) {
            if (!ts.isPropertySignature(rel) || !rel.name || !rel.type) continue;
            const relName = ts.isIdentifier(rel.name) || ts.isStringLiteral(rel.name) ? rel.name.text : undefined;
            if (!relName) continue;
            const found = { names: [] as string[], subjectSets };
            collectTypeRefs(rel.type, found);
            (relationTargets[namespace] ??= {})[relName] = found.names;
          }
        }
        continue;
      }
      if (member.name.text !== "permits") continue;
      if (!member.initializer || !ts.isObjectLiteralExpression(member.initializer)) {
        throw new UnsupportedPermitError(namespace, "*", "permits must be an object literal");
      }

      for (const prop of member.initializer.properties) {
        if (!ts.isPropertyAssignment(prop) || !prop.name || !ts.isIdentifier(prop.name)) {
          throw new UnsupportedPermitError(namespace, "*", "each permit must be a named arrow function");
        }
        const permit = prop.name.text;
        const body = permitBody(namespace, permit, prop.initializer);
        collect(namespace, permit, body, rules);
      }
    }
  }

  return { rules: dedupe(rules), relationTargets, subjectSets };
}

function collectTypeRefs(node: ts.TypeNode, out: { names: string[]; subjectSets: Expandable[] }): void {
  if (ts.isArrayTypeNode(node)) return collectTypeRefs(node.elementType, out);
  if (ts.isParenthesizedTypeNode(node)) return collectTypeRefs(node.type, out);
  if (ts.isUnionTypeNode(node)) {
    for (const t of node.types) collectTypeRefs(t, out);
    return;
  }
  if (!ts.isTypeReferenceNode(node) || !ts.isIdentifier(node.typeName)) return;
  const name = node.typeName.text;
  const args = node.typeArguments ?? [];
  if (name === "Array" && args[0]) return collectTypeRefs(args[0], out);
  if (name === "SubjectSet") {
    const [ns, rel] = args;
    if (
      ns && rel &&
      ts.isTypeReferenceNode(ns) && ts.isIdentifier(ns.typeName) &&
      ts.isLiteralTypeNode(rel) && ts.isStringLiteral(rel.literal)
    ) {
      out.subjectSets.push({ namespace: ns.typeName.text, relation: rel.literal.text });
    }
    return;
  }
  out.names.push(name);
}

function permitBody(namespace: string, permit: string, node: ts.Expression): ts.Expression {
  if (!ts.isArrowFunction(node) && !ts.isFunctionExpression(node)) {
    throw new UnsupportedPermitError(namespace, permit, "permit must be an arrow function");
  }
  const body = node.body;
  if (ts.isBlock(body)) {
    const [only] = body.statements;
    if (body.statements.length !== 1 || !ts.isReturnStatement(only) || !only.expression) {
      throw new UnsupportedPermitError(namespace, permit, "function body must be a single return");
    }
    return only.expression;
  }
  return body;
}

function collect(namespace: string, permit: string, expr: ts.Expression, out: PermitRule[]): void {
  const e = unwrap(expr);

  if (ts.isBinaryExpression(e)) {
    if (e.operatorToken.kind !== ts.SyntaxKind.BarBarToken) {
      throw new UnsupportedPermitError(namespace, permit, `operator "${e.operatorToken.getText()}"`);
    }
    collect(namespace, permit, e.left, out);
    collect(namespace, permit, e.right, out);
    return;
  }

  if (ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression)) {
    const method = e.expression.name.text;
    const target = e.expression.expression;

    if (method === "includes") {
      const relation = thisRelation(target);
      if (relation && isCtxSubject(e.arguments[0])) {
        out.push({ namespace, permit, kind: "relation", source: relation });
        return;
      }
    }

    if (method === "traverse") {
      const relation = thisRelation(target);
      const via = relation ? traverseTarget(e.arguments[0]) : undefined;
      if (relation && via) {
        out.push({ namespace, permit, kind: "traverse", source: relation, viaPermit: via });
        return;
      }
    }

    if (isThisMember(target, "permits") && isCtx(e.arguments[0])) {
      out.push({ namespace, permit, kind: "permit", source: method });
      return;
    }
  }

  throw new UnsupportedPermitError(namespace, permit, `expression "${e.getText()}"`);
}

function unwrap(expr: ts.Expression): ts.Expression {
  let e = expr;
  while (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isNonNullExpression(e)) {
    e = e.expression;
  }
  return e;
}

function isThisMember(node: ts.Expression, name: string): boolean {
  return (
    ts.isPropertyAccessExpression(node) &&
    node.expression.kind === ts.SyntaxKind.ThisKeyword &&
    node.name.text === name
  );
}

function thisRelation(node: ts.Expression): string | undefined {
  if (ts.isPropertyAccessExpression(node) && isThisMember(node.expression, "related")) {
    return node.name.text;
  }
  return undefined;
}

function isCtx(node: ts.Expression | undefined): boolean {
  return !!node && ts.isIdentifier(node) && node.text === "ctx";
}

function isCtxSubject(node: ts.Expression | undefined): boolean {
  return (
    !!node &&
    ts.isPropertyAccessExpression(node) &&
    isCtx(node.expression) &&
    node.name.text === "subject"
  );
}

function traverseTarget(node: ts.Expression | undefined): string | undefined {
  if (!node || !ts.isArrowFunction(node) || node.parameters.length !== 1) return undefined;
  const param = node.parameters[0].name;
  if (!ts.isIdentifier(param) || ts.isBlock(node.body)) return undefined;
  const call = unwrap(node.body);
  if (!ts.isCallExpression(call) || !ts.isPropertyAccessExpression(call.expression)) return undefined;

  const method = call.expression.name.text;
  const owner = call.expression.expression;

  if (
    method === "includes" &&
    isCtxSubject(call.arguments[0]) &&
    ts.isPropertyAccessExpression(owner) &&
    ts.isPropertyAccessExpression(owner.expression) &&
    ts.isIdentifier(owner.expression.expression) &&
    owner.expression.expression.text === param.text &&
    owner.expression.name.text === "related"
  ) {
    return owner.name.text;
  }

  if (!ts.isPropertyAccessExpression(owner) || !ts.isIdentifier(owner.expression)) return undefined;
  if (owner.expression.text !== param.text) return undefined;

  if (owner.name.text === "permits" && isCtx(call.arguments[0])) return method;
  return undefined;
}

function dedupe(rules: PermitRule[]): PermitRule[] {
  const seen = new Set<string>();
  return rules.filter((r) => {
    const key = `${r.namespace}|${r.permit}|${r.kind}|${r.source}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const quote = (s: string) => `'${s.replace(/'/g, "''")}'`;

export function permitModelToSql(model: PermitModel): string {
  const rules = model.rules.map((r) =>
    `(${quote(r.namespace)}, ${quote(r.permit)}, ${quote(r.kind)}, ${quote(r.source)}, ${
      r.kind === "traverse" ? quote(r.viaPermit) : "NULL"
    })`,
  );
  const expandable = model.expandable.map((e) => `(${quote(e.namespace)}, ${quote(e.relation)})`);
  return [
    "BEGIN;",
    "DELETE FROM permissions.permit_rules;",
    "DELETE FROM permissions.permit_expandable;",
    ...(rules.length
      ? [`INSERT INTO permissions.permit_rules (namespace, permit, kind, source, via_permit) VALUES\n  ${rules.join(",\n  ")};`]
      : []),
    ...(expandable.length
      ? [`INSERT INTO permissions.permit_expandable (namespace, relation) VALUES\n  ${expandable.join(",\n  ")};`]
      : []),
    "COMMIT;",
    "",
  ].join("\n");
}
