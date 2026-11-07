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

export function extractPermitRules(source: string, fileName = "permissions.ts"): PermitRule[] {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const rules: PermitRule[] = [];

  for (const stmt of file.statements) {
    if (!ts.isClassDeclaration(stmt) || !stmt.name) continue;
    const namespace = stmt.name.text;

    for (const member of stmt.members) {
      if (!ts.isPropertyDeclaration(member) || !ts.isIdentifier(member.name)) continue;
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

  return dedupe(rules);
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

export function permitRulesToSql(rules: PermitRule[]): string {
  const rows = rules.map((r) =>
    `(${quote(r.namespace)}, ${quote(r.permit)}, ${quote(r.kind)}, ${quote(r.source)}, ${
      r.kind === "traverse" ? quote(r.viaPermit) : "NULL"
    })`,
  );
  const insert = rows.length
    ? `INSERT INTO auth.permit_rules (namespace, permit, kind, source, via_permit) VALUES\n  ${rows.join(",\n  ")};\n`
    : "";
  return `BEGIN;\nDELETE FROM auth.permit_rules;\n${insert}COMMIT;\n`;
}
