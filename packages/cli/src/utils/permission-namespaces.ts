import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";

export interface NamespaceFile {
  name: string;
  contents: string;
}

export interface NamespaceRequirement {
  namespace: string;
  file: string;
  relations: string[];
  permits: string[];
}

export interface PermissionRequirements {
  files: NamespaceFile[];
  namespaces: NamespaceRequirement[];
}

export interface NamespaceComparison {
  namespace: string;
  file: string;
  missingClass: boolean;
  missingRelations: string[];
  missingPermits: string[];
}

const API_PATHS = "/api/v1/permissions/requirements";
const GITHUB_REPO = "PhoenixSolutionsGroup/omnibase";
const GITHUB_NAMESPACES_PATH = "apps/api/permissions";

export function permissionsDir(root: string): string {
  return path.join(root, "omnibase", "permissions");
}

export async function fetchPermissionRequirements(
  apiUrl: string,
  fetchFn: typeof fetch = fetch,
): Promise<PermissionRequirements | null> {
  const res = await fetchFn(`${apiUrl.replace(/\/$/, "")}${API_PATHS}`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to fetch permission requirements (${res.status})`);
  }
  return (await res.json()) as PermissionRequirements;
}

export async function fetchNamespaceFilesFromGithub(
  apiVersion: string,
  fetchFn: typeof fetch = fetch,
): Promise<NamespaceFile[]> {
  const ref = `api-v${apiVersion}`;
  const listRes = await fetchFn(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_NAMESPACES_PATH}?ref=${ref}`,
    {
      headers: { Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!listRes.ok) {
    throw new Error(`GitHub returned ${listRes.status} for ${ref}`);
  }

  const entries = (await listRes.json()) as Array<{ name: string; type: string }>;
  const names = entries
    .filter((entry) => entry.type === "file" && entry.name.endsWith(".ts"))
    .map((entry) => entry.name);

  const files = await Promise.all(
    names.map(async (name) => {
      const rawRes = await fetchFn(
        `https://raw.githubusercontent.com/${GITHUB_REPO}/${ref}/${GITHUB_NAMESPACES_PATH}/${name}`,
        { signal: AbortSignal.timeout(10_000) },
      );
      if (!rawRes.ok) {
        throw new Error(`GitHub returned ${rawRes.status} for ${ref}/${name}`);
      }
      return { name, contents: await rawRes.text() };
    }),
  );

  return files;
}

export function writeNamespaceFiles(root: string, files: NamespaceFile[]): string[] {
  const dir = permissionsDir(root);
  fs.mkdirSync(dir, { recursive: true });

  const written: string[] = [];
  for (const file of files) {
    const target = path.join(dir, file.name);
    if (fs.existsSync(target)) continue;
    fs.writeFileSync(target, file.contents);
    written.push(file.name);
  }
  return written;
}

export function compareNamespaceSource(
  requirement: NamespaceRequirement,
  source: string,
): NamespaceComparison {
  const sourceFile = parseSource(requirement.file, source);
  const classNode = findClass(sourceFile, requirement.namespace);

  if (!classNode) {
    return {
      namespace: requirement.namespace,
      file: requirement.file,
      missingClass: true,
      missingRelations: requirement.relations,
      missingPermits: requirement.permits,
    };
  }

  const relations = new Set(
    relatedMembers(classNode)?.members.map(memberName).filter(Boolean) ?? [],
  );
  const permits = new Set(
    permitsObject(classNode)?.properties.map(memberName).filter(Boolean) ?? [],
  );

  return {
    namespace: requirement.namespace,
    file: requirement.file,
    missingClass: false,
    missingRelations: requirement.relations.filter((key) => !relations.has(key)),
    missingPermits: requirement.permits.filter((key) => !permits.has(key)),
  };
}

export function compareNamespaceFiles(
  root: string,
  requirements: PermissionRequirements,
): NamespaceComparison[] {
  return requirements.namespaces.map((requirement) => {
    const filePath = path.join(permissionsDir(root), requirement.file);
    if (!fs.existsSync(filePath)) {
      return {
        namespace: requirement.namespace,
        file: requirement.file,
        missingClass: true,
        missingRelations: requirement.relations,
        missingPermits: requirement.permits,
      };
    }
    return compareNamespaceSource(requirement, fs.readFileSync(filePath, "utf-8"));
  });
}

export function applyNamespaceFix(
  root: string,
  requirements: PermissionRequirements,
): { written: string[]; fixed: string[] } {
  const written = writeNamespaceFiles(root, requirements.files);
  const fixed: string[] = [];

  for (const requirement of requirements.namespaces) {
    const filePath = path.join(permissionsDir(root), requirement.file);
    const apiFile = requirements.files.find((file) => file.name === requirement.file);
    if (!apiFile || !fs.existsSync(filePath)) continue;

    const before = fs.readFileSync(filePath, "utf-8");
    const after = fixNamespaceSource(before, requirement, apiFile);
    if (after !== before) {
      fs.writeFileSync(filePath, after);
      fixed.push(requirement.namespace);
    }
  }

  return { written, fixed };
}

export function fixNamespaceSource(
  source: string,
  requirement: NamespaceRequirement,
  apiFile: NamespaceFile,
): string {
  const comparison = compareNamespaceSource(requirement, source);
  if (comparison.missingClass) {
    const apiSourceFile = parseSource(apiFile.name, apiFile.contents);
    const apiClass = findClass(apiSourceFile, requirement.namespace);
    if (!apiClass) return source;
    const classText = apiFile.contents.slice(apiClass.getStart(apiSourceFile), apiClass.end);
    return `${source.replace(/\s*$/, "")}\n\n${classText}\n`;
  }

  let updated = source;

  if (comparison.missingRelations.length > 0) {
    if (hasClassMember(updated, requirement, "related")) {
      const texts = comparison.missingRelations
        .map((key) => memberText(apiFile, requirement.namespace, "related", key))
        .filter((text): text is string => Boolean(text));
      if (texts.length > 0) {
        updated = insertMembers(updated, requirement, "related", texts);
      }
    } else {
      const text = classMemberText(apiFile, requirement.namespace, "related");
      if (text) updated = insertClassMembers(updated, requirement, [text]);
    }
  }

  if (comparison.missingPermits.length > 0) {
    if (hasClassMember(updated, requirement, "permits")) {
      const texts = comparison.missingPermits
        .map((key) => memberText(apiFile, requirement.namespace, "permits", key))
        .filter((text): text is string => Boolean(text));
      if (texts.length > 0) {
        updated = insertMembers(updated, requirement, "permits", texts);
      }
    } else {
      const text = classMemberText(apiFile, requirement.namespace, "permits");
      if (text) updated = insertClassMembers(updated, requirement, [text]);
    }
  }

  return updated;
}

type MemberContainer = "related" | "permits";

function hasClassMember(
  source: string,
  requirement: NamespaceRequirement,
  name: string,
): boolean {
  const classNode = findClass(parseSource(requirement.file, source), requirement.namespace);
  return Boolean(classNode && classMemberNode(classNode, name));
}

function classMemberText(
  apiFile: NamespaceFile,
  namespace: string,
  name: string,
): string | null {
  const sourceFile = parseSource(apiFile.name, apiFile.contents);
  const classNode = findClass(sourceFile, namespace);
  const member = classNode && classMemberNode(classNode, name);
  if (!member) return null;
  return apiFile.contents.slice(member.getFullStart(), member.end).trim();
}

function insertClassMembers(
  source: string,
  requirement: NamespaceRequirement,
  texts: string[],
): string {
  const classNode = findClass(parseSource(requirement.file, source), requirement.namespace);
  if (!classNode) return source;

  const close = classNode.end - 1;
  if (source[close] !== "}") return source;

  const before = source.slice(0, close).replace(/\s+$/, "");
  const after = source.slice(close);
  const lineStart = source.lastIndexOf("\n", close - 1) + 1;
  const closingIndent = /^\s*$/.test(source.slice(lineStart, close))
    ? source.slice(lineStart, close)
    : "";

  return `${before}\n\n${texts.join("\n\n")}\n${closingIndent}${after}`;
}

function classMemberNode(
  classNode: ts.ClassDeclaration,
  name: string,
): ts.PropertyDeclaration | undefined {
  for (const member of classNode.members) {
    if (
      ts.isPropertyDeclaration(member) &&
      member.name &&
      ts.isIdentifier(member.name) &&
      member.name.text === name
    ) {
      return member;
    }
  }
  return undefined;
}

function memberText(
  apiFile: NamespaceFile,
  namespace: string,
  container: MemberContainer,
  key: string,
): string | null {
  const sourceFile = parseSource(apiFile.name, apiFile.contents);
  const classNode = findClass(sourceFile, namespace);
  if (!classNode) return null;

  const node =
    container === "related"
      ? relatedMembers(classNode)?.members.find((member) => memberName(member) === key)
      : permitsObject(classNode)?.properties.find((member) => memberName(member) === key);
  if (!node) return null;

  return apiFile.contents.slice(node.getFullStart(), node.end).trim();
}

function insertMembers(
  source: string,
  requirement: NamespaceRequirement,
  container: MemberContainer,
  texts: string[],
): string {
  const sourceFile = parseSource(requirement.file, source);
  const classNode = findClass(sourceFile, requirement.namespace);
  if (!classNode) return source;

  const node =
    container === "related" ? relatedMembers(classNode) : permitsObject(classNode);
  if (!node) return source;

  const close = node.end - 1;
  if (source[close] !== "}") return source;

  const before = source.slice(0, close).replace(/\s+$/, "");
  const after = source.slice(close);
  const hasMembers =
    container === "related"
      ? (node as ts.TypeLiteralNode).members.length > 0
      : (node as ts.ObjectLiteralExpression).properties.length > 0;

  let separator = "";
  if (hasMembers) {
    const last = before[before.length - 1];
    if (container === "related") {
      if (last !== "," && last !== ";") separator = ";";
    } else if (last !== ",") {
      separator = ",";
    }
  }

  const lineStart = source.lastIndexOf("\n", close - 1) + 1;
  const closingIndent = /^\s*$/.test(source.slice(lineStart, close))
    ? source.slice(lineStart, close)
    : "";

  return `${before}${separator}\n\n${texts.join("\n\n")}\n${closingIndent}${after}`;
}

function parseSource(fileName: string, source: string): ts.SourceFile {
  return ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function findClass(sourceFile: ts.SourceFile, name: string): ts.ClassDeclaration | undefined {
  for (const statement of sourceFile.statements) {
    if (ts.isClassDeclaration(statement) && statement.name?.text === name) {
      return statement;
    }
  }
  return undefined;
}

function relatedMembers(classNode: ts.ClassDeclaration): ts.TypeLiteralNode | undefined {
  for (const member of classNode.members) {
    if (
      ts.isPropertyDeclaration(member) &&
      member.name &&
      ts.isIdentifier(member.name) &&
      member.name.text === "related" &&
      member.type &&
      ts.isTypeLiteralNode(member.type)
    ) {
      return member.type;
    }
  }
  return undefined;
}

function permitsObject(classNode: ts.ClassDeclaration): ts.ObjectLiteralExpression | undefined {
  for (const member of classNode.members) {
    if (
      ts.isPropertyDeclaration(member) &&
      member.name &&
      ts.isIdentifier(member.name) &&
      member.name.text === "permits" &&
      member.initializer &&
      ts.isObjectLiteralExpression(member.initializer)
    ) {
      return member.initializer;
    }
  }
  return undefined;
}

function memberName(member: ts.Node): string | undefined {
  if ("name" in member) {
    const name = (member as ts.NamedDeclaration).name;
    if (name && ts.isIdentifier(name)) return name.text;
    if (name && ts.isStringLiteral(name)) return name.text;
  }
  return undefined;
}
